using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace DeFi10.API.Infrastructure.Json
{
    public class StringToDecimalConverter : JsonConverter<decimal>
    {
        public override decimal Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Number)
            {
                return reader.GetDecimal();
            }

            if (reader.TokenType == JsonTokenType.String)
            {
                var stringValue = reader.GetString();
                if (string.IsNullOrWhiteSpace(stringValue))
                {
                    return 0m;
                }

                if (decimal.TryParse(stringValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
                {
                    return result;
                }

                throw new JsonException($"Unable to convert \"{stringValue}\" to decimal");
            }

            throw new JsonException($"Unexpected token type {reader.TokenType} when parsing decimal");
        }

        public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options)
        {
            writer.WriteNumberValue(value);
        }
    }
}
