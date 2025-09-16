using MyWebWallet.API.Services;
using MyWebWallet.API.Services.Interfaces;
using MyWebWallet.API.Services.Mappers;
using MyWebWallet.API.Services.Models;
using StackExchange.Redis;

// Criar o builder com configuração mínima
var builder = WebApplication.CreateBuilder(args);

// Para produção, forçar HTTP-only usando abordagem correta (.NET 9 usa HTTP_PORTS/HTTPS_PORTS)
if (builder.Environment.IsProduction())
{
    var renderPort = Environment.GetEnvironmentVariable("PORT") ?? "10000"; // Render normalmente define PORT=10000

    // Remover qualquer definição de HTTPS
    Environment.SetEnvironmentVariable("HTTPS_PORTS", null); // chave efetiva em .NET 8/9 containers
    Environment.SetEnvironmentVariable("ASPNETCORE_HTTPS_PORTS", null);
    Environment.SetEnvironmentVariable("ASPNETCORE_HTTPS_PORT", null);

    // Definir apenas HTTP
    Environment.SetEnvironmentVariable("HTTP_PORTS", renderPort);
    Environment.SetEnvironmentVariable("ASPNETCORE_URLS", $"http://0.0.0.0:{renderPort}");

    builder.WebHost.UseKestrel(o =>
    {
        o.ListenAnyIP(int.Parse(renderPort)); // Somente HTTP
    });
}

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "MyWebWallet API", Version = "v1" });
});

// Add CORS for production
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsProduction())
        {
            policy.WithOrigins("https://mywebwallet-frontend.onrender.com");
        }
        else
        {
            policy.WithOrigins(
                "http://localhost:10002",
                "https://localhost:10002");
        }
        policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

builder.Services.AddHealthChecks();

// Configure Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var connectionString = configuration["Redis:ConnectionString"];
    var user = configuration["Redis:User"];
    var password = configuration["Redis:Password"];

    if (string.IsNullOrEmpty(connectionString))
        throw new InvalidOperationException("Redis connection string is required");

    var configurationOptions = ConfigurationOptions.Parse(connectionString);
    if (!string.IsNullOrEmpty(user)) configurationOptions.User = user;
    if (!string.IsNullOrEmpty(password)) configurationOptions.Password = password;
    configurationOptions.AbortOnConnectFail = false;
    configurationOptions.ConnectRetry = 5;
    configurationOptions.ConnectTimeout = 15000;
    configurationOptions.SyncTimeout = 15000;

    Console.WriteLine("INFO: Redis: Connecting to Redis for production");
    return ConnectionMultiplexer.Connect(configurationOptions);
});

builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddSingleton<ITokenLogoService, TokenLogoService>();
builder.Services.AddScoped<MyWebWallet.API.Services.Helpers.TokenHydrationHelper>();

builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IBlockchainService, EthereumService>();
builder.Services.AddScoped<IMoralisService, MoralisService>();
builder.Services.AddScoped<IAaveeService, AaveeService>();
builder.Services.AddScoped<IUniswapV3Service, UniswapV3Service>();
builder.Services.AddScoped<IUniswapV3OnChainService, UniswapV3OnChainService>();
builder.Services.AddScoped<IAlchemyNftService, AlchemyNftService>();

builder.Services.AddScoped<IWalletItemMapper<IEnumerable<TokenDetail>>, MoralisTokenMapper>();
builder.Services.AddScoped<IWalletItemMapper<AaveGetUserSuppliesResponse>, AaveSuppliesMapper>();
builder.Services.AddScoped<IWalletItemMapper<AaveGetUserBorrowsResponse>, AaveBorrowsMapper>();
builder.Services.AddScoped<IWalletItemMapper<UniswapV3GetActivePoolsResponse>, UniswapV3Mapper>();

builder.Services.AddScoped<IWalletItemMapperFactory, WalletItemMapperFactory>();

builder.Services.AddHttpClient<EthereumService>();
builder.Services.AddHttpClient<MoralisService>();

var app = builder.Build();

// IMPORTANT: remover HTTPS redirection (era causa indireta de tentativa de configurar HTTPS)
// Nao usar app.UseHttpsRedirection();

if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MyWebWallet API v1");
        c.RoutePrefix = "swagger";
    });
}

try
{
    var redis = app.Services.GetRequiredService<IConnectionMultiplexer>();
    var database = redis.GetDatabase();
    await database.PingAsync();
    Console.WriteLine("SUCCESS: Redis connection established successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"WARNING: Redis connection failed: {ex.Message}");
    Console.WriteLine("Application will continue without caching");
}

try
{
    var tokenLogoService = app.Services.GetRequiredService<ITokenLogoService>();
    await tokenLogoService.LoadAllTokensIntoMemoryAsync();
    var baseCount = await tokenLogoService.GetCachedTokenCountAsync(MyWebWallet.API.Models.Chain.Base);
    var bnbCount = await tokenLogoService.GetCachedTokenCountAsync(MyWebWallet.API.Models.Chain.BNB);
    Console.WriteLine($"SUCCESS: Token logos loaded - Base: {baseCount}, BNB: {bnbCount}");
}
catch (Exception ex)
{
    Console.WriteLine($"WARNING: Token logo service initialization failed: {ex.Message}");
}

app.MapHealthChecks("/health");
app.UseCors();
app.MapControllers();

var environment = app.Environment.EnvironmentName;
var currentPort = Environment.GetEnvironmentVariable("PORT") ?? Environment.GetEnvironmentVariable("HTTP_PORTS") ?? "10000";
Console.WriteLine($"INFO: MyWebWallet API starting in {environment} environment on port {currentPort} (HTTP-only, HTTPS disabled)");

app.Run();
