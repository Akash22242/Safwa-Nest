import mongoose from "mongoose";

const { Schema } = mongoose;

// One work entry (start -> end)
const workEntrySchema = new Schema(
  {
    startTime: { type: Date, required: true, default: Date.now },
    endTime:   { type: Date },                 // optional now
    totalHours:{ type: Number },               // computed when end set
    rating:    { type: Number, min: 0, max: 5, default: 0 },
  },
  { _id: false }
);

// Compute totalHours when both times exist
workEntrySchema.pre("validate", function (next) {
  if (this.startTime && this.endTime) {
    if (this.endTime <= this.startTime) {
      return next(new Error("endTime must be after startTime"));
    }
    const hours = (this.endTime - this.startTime) / (1000 * 60 * 60);
    this.totalHours = Math.round(hours * 100) / 100;
  }
  next();
});

const employeeSchema = new Schema(
  {
    name:  { type: String, trim: true, required: true, minlength: 2, maxlength: 60 },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    age:   { type: Number, min: 0, max: 120 },
    startWorkingDate: { type: Date, required: true },

    rating: { type: Number, min: 0, max: 5, default: 0 },

    workLogs: { type: [workEntrySchema], default: [] },
  },
  { timestamps: true }
);

employeeSchema.index({ email: 1 }, { unique: true });

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
