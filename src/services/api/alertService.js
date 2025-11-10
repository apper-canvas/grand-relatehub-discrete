import { taskService } from "./taskService";
import { activityService } from "./activityService";
import { contactService } from "./contactService";
import { format, isAfter, isToday, isTomorrow, subDays, parseISO } from "date-fns";
import React from "react";
import Error from "@/components/ui/Error";

class AlertService {
  constructor() {
    this.dismissedAlerts = new Set();
  }

  // Simulate delay for realistic API behavior
  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async getAll() {
    await this.delay();
    
    try {
      const [tasks, activities, contacts] = await Promise.all([
        taskService.getAll(),
        activityService.getAll(),
        contactService.getAll()
      ]);

      const alerts = [];
      const now = new Date();

      // Task-based alerts
      tasks.forEach(task => {
        if (task.completed_c) return;

        const alertKey = `task-${task.Id}`;

        // Overdue tasks (past due date and not completed)
        if (task.due_date_c) {
          const dueDate = parseISO(task.due_date_c);
          
          if (!task.completed_c && isAfter(now, dueDate) && !this.dismissedAlerts.has(alertKey)) {
alerts.push({
              Id: `overdue-${task.Id}`,
              type: 'task_overdue',
              priority: 'high',
              title: 'Task Overdue',
              message: `"${task.title_c}" was due ${format(dueDate, 'MMM d, yyyy')}`,
              taskId: task.Id,
              task: task,
              timestamp: task.due_date_c,
              actions: [
                { type: 'complete', label: 'Mark Complete' },
                { type: 'dismiss', label: 'Dismiss' }
              ]
            });
          }

          // Tasks due today
          if (!task.completed_c && isToday(dueDate) && !this.dismissedAlerts.has(alertKey)) {
            alerts.push({
              Id: `due-today-${task.Id}`,
              type: 'task_due_today',
              priority: 'medium',
              title: 'Task Due Today',
              message: `"${task.title_c}" is due today`,
              taskId: task.Id,
              task: task,
              timestamp: task.due_date_c,
              actions: [
                {
                  label: 'Mark Complete',
                  action: 'complete_task'
                }
              ]
            });
          }

          // Tasks due tomorrow
          if (!task.completed_c && isTomorrow(dueDate) && !this.dismissedAlerts.has(alertKey)) {
            alerts.push({
              Id: `due-tomorrow-${task.Id}`,
              type: 'task_due_tomorrow',
              priority: 'low',
              title: 'Task Due Tomorrow',
              message: `"${task.title_c}" is due tomorrow`,
              taskId: task.Id,
              task: task,
              timestamp: task.due_date_c,
              actions: []
            });
          }
        }
});
      // Activity-based alerts (follow-ups needed)
      const sevenDaysAgo = subDays(now, 7);
      const recentActivities = activities
        .filter(activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= sevenDaysAgo && activityDate <= now;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Group by contact and suggest follow-ups for recent activities
      const contactActivityMap = {};
recentActivities.forEach(activity => {
        if (!contactActivityMap[activity.contact_id_c?.Id]) {
          contactActivityMap[activity.contact_id_c?.Id] = [];
        }
        contactActivityMap[activity.contact_id_c?.Id].push(activity);
      });

      Object.entries(contactActivityMap).forEach(([contactId, contactActivities]) => {
        const alertKey = `follow-up-${contactId}`;
        if (this.dismissedAlerts.has(alertKey)) return;
const contact = contacts.find(c => c.Id === parseInt(contactId));
        const latestActivity = contactActivities[0];
        
        if (contact && contactActivities.length > 0) {
          const daysSinceLastActivity = (now.getTime() - new Date(latestActivity.timestamp_c).getTime()) / (1000 * 3600 * 24);
          
          if (daysSinceLastActivity >= 7) {
            alerts.push({
              Id: `follow-up-${contactId}`,
              type: 'contact_follow_up',
              priority: 'medium',
              title: 'Follow-up Required',
              message: `No recent activity with ${contact.name_c}`,
              contactId: parseInt(contactId),
              contact: contact,
              activities: contactActivities,
timestamp: latestActivity.timestamp_c,
              actions: [
                { type: 'dismiss', label: 'Dismiss' }
              ]
            });
          }
        }
      });
      // Sort by priority and timestamp
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      alerts.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      return alerts;
    } catch (error) {
      console.error('AlertService.getAll error:', error);
      throw new Error('Failed to load alerts');
    }
  }

  async dismissAlert(alertId) {
    await this.delay(100);
    this.dismissedAlerts.add(alertId.replace(/^(overdue|due-today|due-tomorrow|follow-up)-/, ''));
    return { success: true };
  }

async completeTask(taskId) {
    await this.delay(200);
    try {
      await taskService.update(taskId, { completed_c: true });
      this.dismissedAlerts.add(`task-${taskId}`);
      return { success: true };
    } catch (error) {
      console.error('AlertService.completeTask error:', error);
      throw new Error('Failed to complete task');
    }
  }

  clearDismissedAlerts() {
    this.dismissedAlerts.clear();
  }
}

export const alertService = new AlertService();