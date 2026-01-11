// routes/worklogs.js
import express from "express";
import Employee from "../models/Employee.js"; // your schema file

const router = express.Router();

const parseBool = (v, d = false) => {
  if (v === undefined) return d;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes";
};

const parseIntSafe = (v, d) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

/**
 * GET /api/worklogs/daily
 * Query params:
 *  - days: number of latest days to return (default 1; "latest day-wise")
 *  - tz: IANA timezone (default 'UTC')
 *  - includeOpen: 'true' to include logs without endTime (default false)
 *  - format: 'grouped' (default) | 'flat'
 *  - start, end: ISO datetimes for filtering by startTime (used mainly with format=flat)
 *  - email, name: optional filters
 */
router.get("/daily", async (req, res) => {
  try {
    const {
      tz = "UTC",
      days = "1",
      includeOpen = "false",
      format = "grouped",
      start,
      end,
      email,
      name,
    } = req.query;

    const daysInt = parseIntSafe(days, 1);
    const includeOpenBool = parseBool(includeOpen, false);

    // Pipeline foundation: expand logs and prepare fields
    const base = [
      { $unwind: "$workLogs" },
      {
        $addFields: {
          log: "$workLogs",
          name: "$name",
          email: "$email",
        },
      },
    ];

    // Optional filters at document level
    if (email) base.push({ $match: { email } });
    if (name) base.push({ $match: { name } });

    // Only ended logs by default (you asked for start, end, totalHours)
    if (!includeOpenBool) {
      base.push({ $match: { "log.endTime": { $exists: true, $ne: null } } });
    } else {
      // include open logs (no endTime)
      base.push({ $match: { "log.startTime": { $exists: true, $ne: null } } });
    }

    // Optional time-range filter (useful mainly with format=flat)
    if (start) base.push({ $match: { "log.startTime": { $gte: new Date(start) } } });
    if (end) base.push({ $match: { "log.startTime": { $lte: new Date(end) } } });

    // Compute day boundary in the requested timezone + a safe totalHours fallback
    base.push({
      $addFields: {
        day: {
          $dateTrunc: { date: "$log.startTime", unit: "day", timezone: tz },
        },
        dayStr: {
          $dateToString: {
            date: {
              $dateTrunc: { date: "$log.startTime", unit: "day", timezone: tz },
            },
            format: "%Y-%m-%d",
            timezone: tz,
          },
        },
        // If totalHours is missing (older docs), compute it on the fly
        coalescedTotalHours: {
          $cond: [
            { $and: [{ $ne: ["$log.endTime", null] }, { $ifNull: ["$log.endTime", false] }] },
            {
              $ifNull: [
                "$log.totalHours",
                {
                  $round: [
                    {
                      $divide: [
                        { $subtract: ["$log.endTime", "$log.startTime"] },
                        1000 * 60 * 60,
                      ],
                    },
                    2,
                  ],
                },
              ],
            },
            null, // when includeOpen=true and endTime is null
          ],
        },
      },
    });

    if (format === "flat") {
      // Flattened list (use start/end to control the window; latest-first ordering)
      const pipeline = [
        ...base,
        {
          $project: {
            _id: 0,
            date: "$dayStr",
            name: 1,
            email: 1,
            startTime: "$log.startTime",
            endTime: "$log.endTime",
            totalHours: "$coalescedTotalHours",
            rating: "$log.rating",
          },
        },
        { $sort: { date: -1, startTime: 1 } },
      ];

      const rows = await Employee.aggregate(pipeline).allowDiskUse(true);
      return res.json({
        format: "flat",
        timezone: tz,
        count: rows.length,
        data: rows,
      });
    }

    // Grouped (day-wise) view with latest day(s) first
    const pipeline = [
      ...base,
      // Group each employee's logs per day
      {
        $group: {
          _id: {
            day: "$day",
            dayStr: "$dayStr",
            employeeId: "$_id",
            name: "$name",
            email: "$email",
          },
          logs: {
            $push: {
              startTime: "$log.startTime",
              endTime: "$log.endTime",
              totalHours: "$coalescedTotalHours",
              rating: "$log.rating",
            },
          },
          totalHoursForDay: { $sum: "$coalescedTotalHours" },
        },
      },
      // Roll up to the day level
      {
        $group: {
          _id: "$_id.day",
          dayStr: { $first: "$_id.dayStr" },
          entries: {
            $push: {
              employeeId: "$_id.employeeId",
              name: "$_id.name",
              email: "$_id.email",
              totalHoursForDay: { $round: ["$totalHoursForDay", 2] },
              logs: "$logs",
            },
          },
          grandTotalHours: { $sum: "$totalHoursForDay" },
        },
      },
      { $sort: { _id: -1 } }, // latest day first
      { $limit: daysInt },    // "latest day-wise" by default (days=1)
      {
        $project: {
          _id: 0,
          date: "$dayStr",
          grandTotalHours: { $round: ["$grandTotalHours", 2] },
          entries: 1,
        },
      },
    ];

    const daysData = await Employee.aggregate(pipeline).allowDiskUse(true);
    res.json({
      format: "grouped",
      timezone: tz,
      days: daysInt,
      data: daysData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Server error while aggregating work logs." });
  }
});

export default router;
