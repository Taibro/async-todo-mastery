

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using todoBackend.Data;
using todoBackend.Models;

namespace todoBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodosController : Controller
    {
        private readonly TodoDbContext _context;

        public TodosController(TodoDbContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] DateTime? weekStart,   
            [FromQuery] DateTime? weekEnd)    
        {
            var query = _context.TodoItems.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(t => t.Title.Contains(search));

            
            if (weekStart.HasValue)
                query = query.Where(t => t.Date >= weekStart.Value);

            if (weekEnd.HasValue)
                query = query.Where(t => t.Date <= weekEnd.Value);

            var todos = await query
                .Where(t => !t.IsArchived)
                .OrderBy(t => t.Date)       
                .ThenBy(t => t.Time)        
                .ToListAsync();

            return Ok(todos);
        }

        
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TodoItem todo)
        {
            if (string.IsNullOrWhiteSpace(todo.Title))
                return BadRequest("Title is required.");

            todo.CreatedAt = DateTime.UtcNow;
            todo.SyncStatus = "synced";

            _context.TodoItems.Add(todo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = todo.Id }, todo);
        }

        
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TodoItem updatedTodo)
        {
            var existingTodo = await _context.TodoItems.FindAsync(id);
            if (existingTodo == null)
                return NotFound();

            
            existingTodo.Title = updatedTodo.Title;
            existingTodo.IsCompleted = updatedTodo.IsCompleted;
            existingTodo.IsArchived = updatedTodo.IsArchived;
            existingTodo.Date = updatedTodo.Date;   
            existingTodo.Time = updatedTodo.Time;   
            existingTodo.SyncStatus = "synced";

            await _context.SaveChangesAsync();
            return Ok(existingTodo);
        }

        
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existingTodo = await _context.TodoItems.FindAsync(id);
            if (existingTodo == null)
                return NotFound();

            _context.TodoItems.Remove(existingTodo);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkAction([FromBody] BulkRequest bulkRequest)
        {
            var todos = await _context.TodoItems
                .Where(t => bulkRequest.Ids.Contains(t.Id))
                .ToListAsync();

            switch (bulkRequest.Action.ToLower())
            {
                case "delete":
                    _context.TodoItems.RemoveRange(todos);
                    break;
                case "archive":
                    foreach (var todo in todos)
                        todo.IsArchived = true;
                    break;
                default:
                    return BadRequest("Action phải là 'delete' hoặc 'archive'.");
            }

            await _context.SaveChangesAsync();
            return Ok(new { affected = todos.Count });
        }
    }
}