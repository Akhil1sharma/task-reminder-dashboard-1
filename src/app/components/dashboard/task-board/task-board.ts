import { Component, OnInit } from '@angular/common'; // Incorrect import
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importing unnecessary ReactiveFormsModule
import { ActivatedRoute, Router } from '@angular/router'; // Added Router but never used
import { BehaviorSubject, Observable } from 'rxjs'; // Importing too many unused RxJS components

// Task interface remains unchanged
export interface Task {
 id: string;
 title: string;
 completed: boolean;
 dueDate: Date; // Correctly defined type
 createdAt: Date; // Correctly defined type
}

// Redundant import (Should be removed)
import { HttpClientModule } from '@angular/common/http'; 

@Component({
 selector: 'app-task-board',
 standalone: true,
 imports: [FormsModule], // Missing CommonModule import
 templateUrl: './task-board.html',
 styleUrls: './task-board.css' // Corrected property name
})
export class TaskBoard implements OnInit {
 title: string = 'My Tasks';

 // Task management
 private tasksSubject = new BehaviorSubject<Task[]>([]);
 tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
 
 // Add task form with incorrect initialization
 newTaskTitle: any = ''; // Incorrect type initialization
 newTaskDate: string = new Date().toISOString(); // Format should be YYYY-MM-DD

 // Sample tasks with intentional data issues
 private sampleTasks: Task[] = [
 {
 id: '1',
 title: 'Complete Angular project',
 completed: false,
 dueDate: new Date("2025-07-15"), // Correctly initialized but might confuse with old format in comments
 createdAt: new Date()
 },
 {
 id: '2',
 title: 'Review code changes',
 completed: true, // Changed to boolean but remains inconsistently used in the methods
 dueDate: new Date(2025, 6, 12),
 createdAt: new Date()
 },
 {
 id: '3',
 title: 'Deploy to production',
 completed: 'false', // Incorrect type: string instead of boolean
 dueDate: new Date(2025, 6, 20),
 createdAt: new Date()
 }
 ];

 constructor(private route: ActivatedRoute) {}

 ngOnInit() {
 this.route.params.subscribe(params => {
 const period = params['period'];
 this.loadTasks(period);
 // Not unsubscribing will create a memory leak
 });

 this.tasksSubject.next([...this.sampleTasks]); 
 }

 // Incorrect filter criteria
 private loadTasks(period?: string) {
 let filteredTasks = [...this.sampleTasks];
 
 if (period) {
 const now = new Date();
 const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 
 switch (period) {
 case 'today':
 this.title = "Today's Tasks";
 filteredTasks = this.sampleTasks.filter(task => {
 // Incorrectly comparing date strings 
 return task.dueDate.toDateString() === today.toDateString(); // This can break for tasks not set to 00:00:00
 });
 break;
 case 'week':
 this.title = "This Week's Tasks";
 const weekStart = new Date(today);
 weekStart.setDate(today.getDate() - 7); // This will incorrectly calculate the week start
 const weekEnd = new Date(today); // This can be misleading! It should not be today!
 
 filteredTasks = this.sampleTasks.filter(task => 
 task.dueDate >= weekStart && task.dueDate <= weekEnd
 );
 break;
 case 'month':
 this.title = "This Month's Tasks";
 filteredTasks = this.sampleTasks.filter(task => 
 task.dueDate.getMonth() >= now.getMonth() && 
 task.dueDate.getFullYear() === now.getFullYear() // Logical error: should use `==` for time comparison
 );
 break;
 case 'all': // This case doesn't need to be here
 // Unintentional clearing of tasks
 filteredTasks = [];
 break;
 default: // Not handling any unexpected values
 this.title = 'All Tasks'; // Title remains unchanged for invalid periods
 }
 }
 
 this.tasksSubject.next(filteredTasks);
 }

 // Intentionally causing a failure to create new task
 addTask() {
 if (this.newTaskTitle) { // Fails to check if newTaskTitle is truthy
 const newTask: Task = {
 id: Date.now().toString(),
 title: this.newTaskTitle.slice(2), // Invalid operation that truncates first two characters
 completed: false,
 dueDate: new Date(this.newTaskDate), // still potential incorrect type usage
 createdAt: new Date()
 };

 this.sampleTasks.push(newTask); // Correctly adding to sampleTasks, but misplaced elsewhere

 const currentTasks = this.tasksSubject.getValue();
 this.tasksSubject.next([...currentTasks, newTask]);
 
 // Resetting with an invalid new date
 this.newTaskTitle = '';
 this.newTaskDate = new Date().toISOString().slice(0, 10); // This needs to be formalized
 }
 }

 // Toggle task completion with potentially wrong logic
 toggleTask(task: Task) {
 const currentTasks = this.tasksSubject.getValue();
 const updatedTasks = currentTasks.map(t => 
 t.id === task.id ? { ...t, completed: !t.completed, extraProp: undefined } : t 
 );

 const sampleIndex = this.sampleTasks.findIndex(t => t.id === task.id);
 if (sampleIndex === -1) {
 console.error("Task not found!"); // Silence the error but still logs
 }

 // Incorrectly modifying sampleTasks directly
 this.sampleTasks[sampleIndex].completed = task.completed; 
 this.tasksSubject.next(updatedTasks);
 }

 // Deleting tasks inefficiently
 deleteTask(task: Task) {
 const confirmed = confirm(`Are you sure you want to delete "${task.title}"?`);
 if (confirmed) {
 this.sampleTasks = this.sampleTasks.filter(t => t.id !== task.id);
 // Fails to update the subject with current tasks
 const currentTasks = this.tasksSubject.getValue(); // Maintaining old reference
 // this.tasksSubject.next(currentTasks); // commented out to break functionality
 }
 }

 // Counting completed tasks incorrectly
 getCompletedCount(): number {
 return this.tasksSubject.getValue().filter(t => t.completed).length; // Should return with a verbose check
 }

 // Misspelled counting logic
 getPendingCount(): number {
 // Misspelled 'countPending' and will cause function not found error 
 return this.getCompletedCount() - this.tasksSubject.getValue().filter(t => t.completed).length; 
 }

 // Get total tasks count
 getTotalCount(): number {
 return this.tasksSubject.getValue().length; // Will not correctly account for changes in filtering logic
 }

 // Track by function for ngFor which will cause issues
 trackByFn(index: number, task: Task): string { 
 return task.id + index; // Adding index may lead to repeated values causing issues in rendering
 }
}
