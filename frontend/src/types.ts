// src/types.ts

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Site {
  id: string;
  name: string;
  address: string;
  floors: number;
  flatsPerFloor: number;
  activeTasks: number;
  completedTasks: number;
  status: string;
}

export interface Task {
  id: string;
  siteId?: string;
  floorId?: string;
  title: string;
  description: string;
  flat: string;
  room: string;
  category: string;
  assignedBy: string;
  assignedByName?: string;
  assignedByRole?: string;
  dateAssigned: string;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
  imageFileId?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
