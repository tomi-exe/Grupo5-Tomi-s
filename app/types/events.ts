// types/events.ts - Tipos específicos para el sistema de eventos

import mongoose from "mongoose";

// Interfaces básicas para datos de eventos
export interface EventCapacityData {
  eventName: string;
  maxCapacity: number;
  currentCheckedIn: number;
  availableCapacity: number;
  occupancyPercentage: number;
  isFull: boolean;
}

export interface EventBasicInfo {
  eventName: string;
  eventDate: Date;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  location: string;
  lastUpdated?: Date;
}

// Tipos para respuestas de API
export interface EventCapacityResponse {
  eventName: string;
  capacity: {
    maximum: number;
    current: number;
    available: number;
    occupancyPercentage: number;
    isFull: boolean;
  };
  event: {
    date: string;
    status: string;
    lastUpdated?: string;
  };
  checkInStats?: {
    statusBreakdown: Array<{
      _id: string;
      count: number;
      latestCheckIn: string;
    }>;
    totalSuccessfulCheckIns: number;
    checkInsPerHour: Array<{
      _id: { hour: number; date: string };
      count: number;
    }>;
  };
}

// Tipos para actualizaciones en tiempo real
export interface RealtimeEventUpdate {
  eventName: string;
  capacity: {
    maximum: number;
    current: number;
    available: number;
    occupancyPercentage: number;
    isFull: boolean;
  };
  timestamp: string;
  type: 'initial' | 'update' | 'checkin' | 'alert';
}

// Tipos para Server-Sent Events
export interface SSEMessage {
  type: 'initial' | 'update' | 'checkin' | 'alert' | 'heartbeat' | 'error';
  events?: RealtimeEventUpdate[];
  eventName?: string;
  checkInsCount?: number;
  userName?: string;
  message?: string;
  timestamp: string;
}

// Tipos seguros para documentos de Mongoose con timestamps
export interface EventDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  eventName: string;
  eventDate: Date;
  location: string;
  description?: string;
  maxCapacity: number;
  currentCheckedIn: number;
  basePrice: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  isFull: boolean;
  occupancyPercentage: number;
  availableCapacity: number;
}

// Utility functions para conversión segura de tipos
export function toEventCapacityResponse(event: EventDocument, checkInStats?: any): EventCapacityResponse {
  return {
    eventName: event.eventName,
    capacity: {
      maximum: event.maxCapacity,
      current: event.currentCheckedIn,
      available: event.maxCapacity - event.currentCheckedIn,
      occupancyPercentage: Math.round((event.currentCheckedIn / event.maxCapacity) * 100),
      isFull: event.currentCheckedIn >= event.maxCapacity
    },
    event: {
      date: event.eventDate.toISOString(),
      status: event.status,
      lastUpdated: event.updatedAt.toISOString()
    },
    checkInStats
  };
}

export function toRealtimeEventUpdate(event: EventDocument): RealtimeEventUpdate {
  return {
    eventName: event.eventName,
    capacity: {
      maximum: event.maxCapacity,
      current: event.currentCheckedIn,
      available: event.maxCapacity - event.currentCheckedIn,
      occupancyPercentage: Math.round((event.currentCheckedIn / event.maxCapacity) * 100),
      isFull: event.currentCheckedIn >= event.maxCapacity
    },
    timestamp: new Date().toISOString(),
    type: 'update'
  };
}

// Helper para casting seguro de ObjectId
export function safeObjectIdToString(id: unknown): string {
  if (mongoose.Types.ObjectId.isValid(id as any)) {
    return (id as mongoose.Types.ObjectId).toString();
  }
  return String(id);
}