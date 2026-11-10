import mongoose from "mongoose";
import { Task } from "../models/Task.js";
import { Site } from "../models/Site.js";
import { ObjectId } from "mongodb";
import { getBucket } from "../config/gridfs.js";

const serializeTask = (t) => ({
  id: t._id.toString(),
  siteId: t.site?._id ? t.site._id.toString() : t.site?.toString(),
  floorId: t.floorId,
  title: t.title,
  description: t.description,
  flat: t.flat,
  room: t.room,
  category: t.category,
  priority: t.priority,
  status: t.status,
  assignedBy: t.assignedBy?._id ? t.assignedBy._id.toString() : (t.assignedBy?.toString() || null),
  assignedByName: t.assignedBy?.name || null,
  assignedByRole: t.assignedBy?.role || null,
  dateAssigned: t.dateAssigned,
  imageFileId: t.imageFileId?.toString() || null,
  imageUrl: t.imageFileId ? `/api/files/${t.imageFileId}` : null
});


// ---------------- CREATE TASK ----------------
export const createTask = async (req, res) => {
  try {
    const { siteId, floorId, title, description, flat, room, category, priority } = req.body;

    if (!siteId || !floorId || !title || !description || !flat || !room || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    let imageFileId = null;

    // ✅ This block correctly saves an uploaded file to GridFS
    if (req.file) {
      const bucket = await getBucket();
      imageFileId = await new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(req.file.originalname, {
          contentType: req.file.mimetype,
        });
        uploadStream.end(req.file.buffer);
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.on('error', reject);
      });
    }

    const task = await Task.create({
      site: site._id,
      floorId,
      title,
      description,
      flat,
      room,
      category,
      priority: priority || "medium",
      status: "pending",
      imageFileId, // Save the file ID (or null)
      assignedBy: req.user?.id || null,
      dateAssigned: new Date(),
    });

    res.status(201).json(serializeTask(task));
  } catch (err) {
    console.error("Create task failed:", err);
    res.status(500).json({ message: err.message || "Server error during task creation." });
  }
};

const isWorkerRole = (role) => !['admin', 'builder'].includes(role);

// ---------------- LIST TASKS ----------------
export const listTasksForSite = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { role } = req.user;
    const site = await Site.findById(siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });
    const query = { site: new mongoose.Types.ObjectId(siteId) };
    if (isWorkerRole(role)) {
      query.category = { $in: [role, 'general'] };
    }
    const tasks = await Task.find(query)
      .populate('assignedBy', 'name role email')
      .sort({ createdAt: -1 });
    res.json(tasks.map(serializeTask));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch site tasks", error: err.message });
  }
};

export const listTasksForFloor = async (req, res) => {
  try {
    let { siteId, floorId } = req.params;
    const { role } = req.user;
    if (!floorId.startsWith("floor-")) {
      floorId = `floor-${floorId}`;
    }
    const site = await Site.findById(siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });
    const query = { site: new mongoose.Types.ObjectId(siteId), floorId };
    if (isWorkerRole(role)) {
      query.category = { $in: [role, 'general'] };
    }
    const tasks = await Task.find(query)
      .populate('assignedBy', 'name role email')
      .sort({ createdAt: -1 });
    res.json(tasks.map(serializeTask));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch floor tasks", error: err.message });
  }
};

// ---------------- UPDATE TASK STATUS ----------------
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const { role } = req.user;

    if (!["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // If user is a specialized worker, check they belong to this trade
    if (isWorkerRole(role) && task.category !== role && task.category !== 'general') {
      return res.status(403).json({ message: "You are not assigned to tasks in this trade category." });
    }

    task.status = status;
    await task.save();
    await task.populate('assignedBy', 'name role email');

    res.json(serializeTask(task));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- DELETE TASK ----------------
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.imageFileId) {
      try {
        const bucket = await getBucket();
        await bucket.delete(new ObjectId(task.imageFileId));
      } catch (err) {
        console.warn("Failed to delete image from GridFS:", err.message);
      }
    }
    res.json({ message: "Task deleted successfully", id: task._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};