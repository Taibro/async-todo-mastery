namespace todoBackend.Middleware
{
    public class ChaosMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly Random _random = new();

        public ChaosMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var chaosEnabled = context.Request.Headers["X-Chaos-Mode"] == "true";

            if (chaosEnabled)
            {
                await Task.Delay(3000);

                if (_random.NextDouble() < 0.2)
                {
                    context.Response.StatusCode = 503;
                    await context.Response.WriteAsync("Chaos Mode: Request deliberately failed");
                    return;
                }
            }
            await _next(context);
        }
    }
}
