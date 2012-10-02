$(document).ready(function(){
	'use strict';

	var TodoApp = {
		/* Generates a unique id for each todo */
		generateUUID : function b( a ){
			return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)
		},
		/* Interfaces with the localStorage API to retrieve the todo list */
		getTodos : function(){
			var todos = localStorage.getItem( '_todoApp' );
			return ( todos && JSON.parse( todos ) ) || [];

		},
		/* Interfaces with the localStorage API to store the todo list */
		setTodos : function( todos ){
			localStorage.setItem ( '_todoApp', JSON.stringify( todos ) );
			TodoApp.todos = TodoApp.getTodos();

		},
		/* Main function that sets up the app */
		init : function(){
			this.todoListTemplate = Handlebars.compile( $('#todo-item-template').html() );
			this.todos = TodoApp.getTodos();

			var $todoApp = $('#todoApp'),
				$todoList = $('#todo-list');

			TodoApp.outTodos();

			/* On  */
			$todoApp.on( 'keyup', '#newTodoText', this.createTodo );
			$todoList.on('click', 'a.complete', this.completeTodo );
			$todoList.on('click', 'a.delete', this.deleteTodo );
			$todoList.on('dblclick', 'p.lead', this.modifyTodo );
		},
		/* Renders the todo list */
		outTodos : function(){
			$('#todo-list').html( TodoApp.todoListTemplate( TodoApp.todos ) );
		},
		/* Create a new todo item */
		createTodo : function( e ){
			var $newTodo = $(this),
				newTodoText = $.trim( $newTodo.val() ),
				now = new Date();

			if( e.which === 13 && newTodoText !== '' ){
				TodoApp.todos.push({
					id: TodoApp.generateUUID(),
					text: newTodoText,
					createdOn: now,
					completed: false,
					completedOn: now,
					archived: false
				});

				$newTodo.val('');
				TodoApp.setTodos( TodoApp.todos );
				TodoApp.outTodos();
			}
		},
		/* Delete a new todo item - Cannot be undone */
		deleteTodo : function(){
			var $thisTodo = $(this),
				$thisTodoLi = $thisTodo.closest('li.todo-item'),
				thisTodoId = $thisTodoLi.attr('data-todo-id'),
				isCompleted = $thisTodoLi.hasClass('completed');

			$.each( TodoApp.todos, function( i, todo ){
				if ( todo.id === thisTodoId ) {
					TodoApp.todos.splice( i , 1 );
					TodoApp.setTodos( TodoApp.todos );
					TodoApp.outTodos();
					return false;
				};
			})

		},
		/* Marks the current todo as complete */
		completeTodo : function(){
			var $thisTodo = $(this),
				$thisTodoLi = $thisTodo.closest('li.todo-item'),
				thisTodoId = $thisTodoLi.attr('data-todo-id'),
				isCompleted = $thisTodoLi.hasClass('completed');

			$.each( TodoApp.todos, function( i, todo ){
				if ( todo.id === thisTodoId ) {
					if( !isCompleted ){
						TodoApp.todos[ i ].completed = true;
						TodoApp.todos[ i ].completedOn = new Date();

						/* Reposition completed todos to end of array */
						TodoApp.todos.push( TodoApp.todos[ i ] );
						TodoApp.todos.splice( i, 1 );
						
					} else{
						TodoApp.todos[ i ].completed = false;
						TodoApp.todos[ i ].completedOn = '';

						/* TODO: Sort reactivated todos from the end of the array 
						   to the beginning */
					}
					TodoApp.setTodos( TodoApp.todos );
					TodoApp.outTodos();

					return false;
				};
			})
		},
		/* Modify the text of the current todo */
		modifyTodo : function(){
			var $thisTodo = $(this),
				$thisTodoLi = $thisTodo.closest('li.todo-item'),
				$thisTodoP = $thisTodoLi.find('p.lead'),
				thisTodoId = $thisTodoLi.attr('data-todo-id'),
				isCompleted = $thisTodoLi.hasClass('completed'),
				isArchived = $thisTodoLi.hasClass('archived');

			if( isCompleted || isArchived ){
				return false;
			} else {
				var todoText = $thisTodoP.text();

				$thisTodoP.hide().after('<input type="text" class="modify" value="'+ todoText +'">');
				
				var $inputModify = $thisTodoLi.find('input.modify');
				$inputModify.focus();

				$inputModify.bind('keyup', function( e ){
					if( e.which === 13 && $.trim($inputModify.val()) !== '' ){
						$.each( TodoApp.todos, function( i, todo ){
							if ( todo.id === thisTodoId ) {
								TodoApp.todos[ i ].text = $.trim($inputModify.val());
								TodoApp.setTodos( TodoApp.todos );
								TodoApp.outTodos();

								return false;
							};
						});
					}
				});

				$inputModify.bind('blur', function(){
					$thisTodoP.show();
					$(this).remove();
				});
			}
		},
		/* Archive the todo item. Does not delete the todo but hides it in normal view
		   The user can see archived todos in the Extended mode */
		archiveTodo : function(){
			/* To be developed: Allow the user to archive todo items. 
			These items are hidden from view but will be shown in the Archived Info Mode */
		}
	};

	TodoApp.init();
});

/*  
Roadmap:
1. Todo Completion date
2. Extended info mode
3. Archived info mode
4. Todo counter
5. Completed todo moved to bottom
*/