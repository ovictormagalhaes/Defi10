using DeFi10.API.DTOs;

namespace DeFi10.API.Services.Interfaces;

public interface IProtocolStatusService
{
    ProtocolStatusListResponse GetProtocolStatus();
}
