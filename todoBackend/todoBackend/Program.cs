
using Microsoft.EntityFrameworkCore;
using todoBackend.Data;
using todoBackend.Middleware;

namespace todoBackend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen();

            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<TodoDbContext>(opt =>
                opt.UseSqlServer(connectionString));

            builder.Services.AddCors(
                options =>
                {
                    options.AddPolicy("ReactApp",
                        policy =>
                            policy.WithOrigins("http://localhost:5173")
                                .AllowAnyHeader()
                                .AllowAnyMethod());
                });

            var app = builder.Build();

            using(var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
                dbContext.Database.Migrate();
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("ReactApp");

            app.UseMiddleware<ChaosMiddleware>();
            
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
