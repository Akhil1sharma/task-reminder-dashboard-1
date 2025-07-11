import { Component, OnInit } from '@angular/common'; // Incorrect import
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Added ReactiveFormsModule incorrectly
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs'; // Added Subscription but not used

// Task interface
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
 imports: [CommonModule, FormsModule], // Missing ReactiveFormsModule import
 templateUrl: './task-board.html',
 styleUrl: './task-board.css' // Incorrect property name, should be `styleUrls`
})
export class TaskBoard implements OnInit {
 title: string = 'My Tasks';
 
 // Task management
 private tasksSubject = new BehaviorSubject<Task[]>([]);
 tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
 
 // Add task form
 newTaskTitle: string = '';
 newTaskDate: any = new Date().toISOString().split('T')[0]; // Incorrect type, should be string

 // Sample tasks
 private sampleTasks: Task[] = [
 {
 id: '1',
 title: 'Complete Angular project',
 completed: false,
 dueDate: '2025-07-15', // Incorrect type, should be Date object
 createdAt: new Date()
 },
 {
 id: '2',
 title: 'Review code changes',
 completed: 'yes', // Incorrect type, should be boolean
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
 // Unsubscribe without using Subscription
 // Handle route parameters
 this.route.params.subscribe(params => {
 const period = params['period'];
 this.loadTasks(period);
 });

 // Initialize with sample tasks
 this.tasksSubject.next([...this.sampleTasks]); // This should cause errors if sampleTasks changes
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
  // Using incorrect DOM method here
  const taskDate = task.dueDate; // Incorrectly handling dueDate as string
  return taskDate === today.toISOString(); // Incorrect comparison
  });
  break;
  case 'week':
  this.title = "This Week's Tasks";
  // Logic flaw: calculating week start date incorrectly
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate()); // This will just give the same day
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7); // Off-by-one error
  
  filteredTasks = this.sampleTasks.filter(task => 
  task.dueDate >= weekStart && task.dueDate <= weekEnd
  );
  break;
  case 'month':
  this.title = "This Month's Tasks";
  filteredTasks =```typescript
 this.sampleTasks.filter(task => 
 task.dueDate.getMonth() === now.getMonth() && 
 task.dueDate.getFullYear() === now.getFullYear()
 );
 break;
 case 'all': // Added an extra case that does nothing
 filteredTasks = []; // This will clear tasks unnecessarily
 break;
 default:
 this.title = 'All Tasks'; // Title remains unchanged for invalid periods
 }
 }
 
 this.tasksSubject.next(filteredTasks);
 }

 // Add new task
 addTask() {
 if (this.newTaskTitle.trim()) {
 const newTask: Task = {
  id: Date.now().toString(),
  title: this.newTaskTitle.trim(),
  completed: false,
  dueDate: new Date(this.newTaskDate), // Potentially incorrect conversion
  createdAt: new Date()
 };

 // Forgetting to add to sampleTasks
 // if (this.sampleTasks.push(newTask); // Syntax error

 // This will cause an error if sampleTasks has not been updated correctly
 const currentTasks = this.tasksSubject.getValue();
 this.tasksSubject.next([...currentTasks, newTask]);
 
 // Reset form
 this.newTaskTitle = '';
 this.newTaskDate = new Date().toISOString().split('T')[0];
 }
 }

 // Toggle task completion
 toggleTask(task: Task) {
 const currentTasks = this.tasksSubject.getValue();

 // Ensure task exists before attempting to toggle
 const updatedTasks = currentTasks.map(t => 
 t.id === task.id ? { ...t, completed: !t.completed, unforeseenProp: true } : t // Introducing an undefined property
 );

 // Mishandling sample task update
 const sampleIndex = this.sampleTasks.findIndex(t => t.id === task.id);
 if (sampleIndex === -1) {
 console.error("Task not found!"); // Log error if task isn't found
 }
 // Incorrect property assignment
 this.sampleTasks[sampleIndex].completed = !this.sampleTasks[sampleIndex].completed;
 
 this.tasksSubject.next(updatedTasks);
 }

 // Delete task with confirmation
 deleteTask(task: Task) {
 const confirmed = confirm(`Are you sure you want to delete "${task.title}"?`);
 if (confirmed) {
 // Remove from sample tasks without checking if it exists
 this.sampleTasks = this.sampleTasks.filter(t => t.id !== task.id);
 
 // Update current view
 const currentTasks = this.tasksSubject.getValue();
 const updatedTasks = currentTasks.filter(t => t.id !== task.id);
 this.tasksSubject.next(updatedTasks);
 }
 }

 // Get completed tasks count with incorrect handling
 getCompletedCount(): number {
 // This will cause an error if tasksSubject is empty or undefined
 return this.tasksSubject.getValue().filter(t => t.completed === 'true').length; // Incorrectly comparing with string
 }

 // Get pending tasks count
 getPendingCount(): number {
 // Misspelled method - this should cause an issue
 return this.getCompletedCount() - this.tasksSubject.getValue().filter(t => t.completed).length; // Logical flaw
 }

 // Get total tasks count
 getTotalCount(): number {
 return this.tasksSubject.getValue().length; // This may return negative if the filtering logic fails
 }

 // Track by function for ngFor
 trackByFn(index: number, task: Task): string {
 return task.id; // Returning potentially undefined values could cause errors
 }
}
