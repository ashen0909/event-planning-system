import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { eventService, scheduleService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Event, ScheduleItem, Task } from '../types';
import { Modal, FieldConfig } from '../components/Modal';
import { Card, Button } from '../components/Common';

export const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadData();
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const response = await eventService.getAll();
      setEvents(response.data);
      if (response.data.length > 0) {
        setSelectedEventId(response.data[0].id);
      }
    } catch (error: any) {
      addToast('Failed to load events', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [scheduleRes, tasksRes] = await Promise.all([
        scheduleService.getItems(selectedEventId),
        scheduleService.getTasks(selectedEventId),
      ]);
      setScheduleItems(scheduleRes.data);
      setTasks(tasksRes.data);
    } catch (error: any) {
      addToast('Failed to load schedule', 'error');
    }
  };

  const handleCreateOrUpdateSchedule = async (formData: Record<string, any>) => {
    try {
      if (editingSchedule) {
        await scheduleService.updateItem(selectedEventId, editingSchedule.id, formData);
        addToast('Schedule updated', 'success');
      } else {
        await scheduleService.createItem(selectedEventId, formData);
        addToast('Schedule item added', 'success');
      }
      setEditingSchedule(null);
      loadData();
    } catch (error: any) {
      addToast('Operation failed', 'error');
    }
  };

  const handleCreateOrUpdateTask = async (formData: Record<string, any>) => {
    try {
      if (editingTask) {
        await scheduleService.updateTask(selectedEventId, editingTask.id, formData);
        addToast('Task updated', 'success');
      } else {
        await scheduleService.createTask(selectedEventId, formData);
        addToast('Task added', 'success');
      }
      setEditingTask(null);
      loadData();
    } catch (error: any) {
      addToast('Operation failed', 'error');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await scheduleService.deleteItem(selectedEventId, id);
      addToast('Item deleted', 'success');
      loadData();
    } catch (error: any) {
      addToast('Delete failed', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await scheduleService.deleteTask(selectedEventId, id);
      addToast('Task deleted', 'success');
      loadData();
    } catch (error: any) {
      addToast('Delete failed', 'error');
    }
  };

  const scheduleFields: FieldConfig[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'start_time', label: 'Start Time', type: 'time', required: true },
    { name: 'end_time', label: 'End Time', type: 'time', required: true },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const taskFields: FieldConfig[] = [
    { name: 'title', label: 'Task', type: 'text', required: true },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ToDo', label: 'To Do' },
        { value: 'Doing', label: 'In Progress' },
        { value: 'Done', label: 'Done' },
      ],
    },
    { name: 'due_date', label: 'Due Date', type: 'date' },
    { name: 'assigned_to', label: 'Assigned To', type: 'text' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><p className="text-gray-500">Loading...</p></div>;
  }

  if (events.length === 0) {
    return <Card title="No Events"><p className="text-gray-500">Create an event first</p></Card>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schedule & Tasks</h1>
        <p className="text-gray-500 mt-1">Plan timeline and manage tasks</p>
      </div>

      <Card title="Select Event">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </Card>

      {/* Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Timeline ({scheduleItems.length})</h2>
          <Button size="sm" onClick={() => {
            setEditingSchedule(null);
            setIsScheduleModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {scheduleItems.length === 0 ? (
          <Card><p className="text-gray-500 text-center py-4">No schedule items</p></Card>
        ) : (
          <div className="space-y-2">
            {scheduleItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">
                      {item.start_time} - {item.end_time}
                    </p>
                    {item.notes && <p className="text-sm text-gray-500 mt-1">{item.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSchedule(item);
                        setIsScheduleModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Tasks ({tasks.length})</h2>
          <Button size="sm" onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {tasks.length === 0 ? (
          <Card><p className="text-gray-500 text-center py-4">No tasks</p></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['ToDo', 'Doing', 'Done'].map((status) => (
              <Card key={status} title={status === 'ToDo' ? 'To Do' : status === 'Doing' ? 'In Progress' : 'Done'}>
                <div className="space-y-2">
                  {tasks.filter(t => t.status === status).map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Priority: {task.priority}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-white rounded"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-red-600 hover:bg-white rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isScheduleModalOpen}
        title={editingSchedule ? 'Edit Schedule' : 'Add Schedule Item'}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        onSubmit={handleCreateOrUpdateSchedule}
        fields={scheduleFields}
        defaultValues={editingSchedule || {}}
      />

      <Modal
        isOpen={isTaskModalOpen}
        title={editingTask ? 'Edit Task' : 'Add Task'}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        fields={taskFields}
        defaultValues={editingTask || {}}
      />
    </div>
  );
};
