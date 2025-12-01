using MyWebWallet.API.DTOs;

namespace MyWebWallet.API.Services.Interfaces;

public interface IProtocolStatusService
{
    ProtocolStatusListResponse GetProtocolStatus();
}
