namespace MyWebWallet.API.Models;

public class Protocol {
    public string Name { get; set; }
    public string Chain { get; set; }
    public string Id { get; set; }
    public string Url { get; set; }
    public string Logo { get; set; }

    public string Key => $"{Name?.ToLowerInvariant()}-{Chain?.ToLowerInvariant()}-{Id?.ToLowerInvariant()}";
}
