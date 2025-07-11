 import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css'
})
export class TaskBoard implements OnInit {
  title: string = 'My Tasks';
  
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  
  
  newTaskTitle: string = '';
  newTaskDate: string = new Date().toISOString().split('T')[0];

  
  private sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Complete Angular project',
      completed: false,
      dueDate: new Date(2025, 6, 15),
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Review code changes',
      completed: true,
      dueDate: new Date(2025, 6, 12),
      createdAt: new Date()
    },
    {
      id: '3',
      title: 'Deploy to production',
      completed: false,
      dueDate: new Date(2025, 6, 20),
      createdAt: new Date()
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
  
    this.route.params.subscribe(params => {
      const period = params['period'];
      this.loadTasks(period);
    });

    this.tasksSubject.next([...this.sampleTasks]);
  }

  private loadTasks(period?: string) {
    let filteredTasks = [...this.sampleTasks];
    
    if (period) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (period) {
        case 'today':
          this.title = "Today's Tasks";
          filteredTasks = this.sampleTasks.filter(task => {
            const taskDate = new Date(task.dueDate.getFullYear(), 
                                     task.dueDate.getMonth(), 
                                     task.dueDate.getDate());
            return taskDate.getTime() === today.getTime();
          });
          break;
        case 'week':
          this.title = "This Week's Tasks";
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          filteredTasks = this.sampleTasks.filter(task => 
            task.dueDate >= weekStart && task.dueDate <= weekEnd
          );
          break;
        case 'month':
          this.title = "This Month's Tasks";
          filteredTasks = this.sampleTasks.filter(task => 
            task.dueDate.getMonth() === now.getMonth() && 
            task.dueDate.getFullYear() === now.getFullYear()
          );
          break;
        default:
          this.title = 'All Tasks';
      }
    }
    
    this.tasksSubject.next(filteredTasks);
  }

  addTask() {
    if (this.newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: this.newTaskTitle.trim(),
        completed: false,
        dueDate: new Date(this.newTaskDate),
        createdAt: new Date()
      };

      this.sampleTasks.push(newTask);
      
      const currentTasks = this.tasksSubject.getValue();
      this.tasksSubject.next([...currentTasks, newTask]);
      
      this.newTaskTitle = '';
      this.newTaskDate = new Date().toISOString().split('T')[0];
    }
  }

  toggleTask(task: Task) {
    const currentTasks = this.tasksSubject.getValue();
    const updatedTasks = currentTasks.map(t => 
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    const sampleIndex = this.sampleTasks.findIndex(t => t.id === task.id);
    if (sampleIndex !== -1) {
      this.sampleTasks[sampleIndex].completed = !this.sampleTasks[sampleIndex].completed;
    }
    
    this.tasksSubject.next(updatedTasks);
  }
  deleteTask(task: Task) {
    const confirmed = confirm(`Are you sure you want to delete "${task.title}"?`);
    if (confirmed) {
      this.sampleTasks = this.sampleTasks.filter(t => t.id !== task.id);
      
      const currentTasks = this.tasksSubject.getValue();
      const updatedTasks = currentTasks.filter(t => t.id !== task.id);
      this.tasksSubject.next(updatedTasks);
    }
  }
  getCompletedCount(): number {
    return this.tasksSubject.getValue().filter(t => t.completed).length;
  }
  getPendingCount(): number {
    return this.tasksSubject.getValue().filter(t => !t.completed).length;
  }
  getTotalCount(): number {
    return this.tasksSubject.getValue().length;
  }

  trackByFn(index: number, task: Task): string {
    return task.id;
  }
}