namespace todoBackend.Models
{
    public record BulkRequest(List<int> Ids, string Action);
}
