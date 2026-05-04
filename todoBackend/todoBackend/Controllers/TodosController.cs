using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using todoBackend.Data;

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
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _context.TodoItems.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(t => t.Title.Contains(search));
            }
            var todos = await query
                .Where(t => !t.IsArchived)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(todos);
        }
    }
}
