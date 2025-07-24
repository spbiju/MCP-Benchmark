# Fruityvice MCP Server

Bu MCP (Model Context Protocol) server, Fruityvice API'sini kullanarak meyvelerin beslenme bilgilerini ve detaylarını sağlar.

## Özellikler

- Meyve adına göre beslenme bilgilerini getirme
- Meyvenin familya, genus ve order bilgilerini alma
- Kalori, yağ, şeker, karbonhidrat ve protein değerlerini öğrenme

## Kurulum

1. Gerekli bağımlılıkları yükleyin:
```bash
pip install -r requirements.txt
```

2. MCP serverini çalıştırın:
```bash
python server.py
```

## Kullanım

MCP server çalıştıktan sonra, `get_fruit_nutrition` tool'unu kullanarak meyve bilgilerini alabilirsiniz.

### Örnek Kullanım

```python
# Elma hakkında bilgi almak için:
get_fruit_nutrition("apple")

# Muz hakkında bilgi almak için:
get_fruit_nutrition("banana")

# Portakal hakkında bilgi almak için:
get_fruit_nutrition("orange")
```

### Dönen Veri Formatı

```json
{
  "name": "Apple",
  "family": "Rosaceae", 
  "genus": "Malus",
  "order": "Rosales",
  "nutritions": {
    "calories": 52,
    "fat": 0.4,
    "sugar": 10.3,
    "carbohydrates": 11.4,
    "protein": 0.3
  },
  "id": 6
}
```

## API Kaynağı

Bu server [Fruityvice API](https://www.fruityvice.com/) kullanmaktadır.

## Docker ile Çalıştırma

```bash
docker build -t fruityvice-mcp .
docker run fruityvice-mcp
```
