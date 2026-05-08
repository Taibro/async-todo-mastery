namespace todoBackend.Models
{
    public class TodoItem
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public TimeOnly Time { get; set; }

        public bool IsCompleted { get; set; } = false;

        public bool IsArchived { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? SyncStatus { get; set; }
    }
}
