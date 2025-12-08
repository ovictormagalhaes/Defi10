# Use the official .NET 9 runtime as a parent image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Use the SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["DeFi10.API/DeFi10.API.csproj", "DeFi10.API/"]
RUN dotnet restore "DeFi10.API/DeFi10.API.csproj"

# Copy everything else and build
COPY DeFi10.API/ DeFi10.API/
WORKDIR "/src/DeFi10.API"
RUN dotnet build "DeFi10.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "DeFi10.API.csproj" -c Release -o /app/publish --no-restore

# Final stage/image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create a non-privileged user that the app will run under
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl --fail http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "DeFi10.API.dll"]