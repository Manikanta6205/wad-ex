const axios = require('axios')

const API_URL = 'http://localhost:5000'

const commonWords = [
  "about", "above", "across", "act", "active", "activity", "add", "afraid", "after", "again",
  "age", "ago", "agree", "air", "all", "alone", "along", "already", "always", "am",
  "amount", "an", "and", "angry", "another", "answer", "any", "anyone", "anything", "anytime",
  "appear", "apple", "are", "area", "arm", "army", "around", "arrive", "art", "article",
  "artist", "as", "ask", "at", "attack", "aunt", "autumn", "away", "baby", "back",
  "bad", "bag", "ball", "bank", "base", "basket", "bath", "be", "bean", "bear",
  "beautiful", "bed", "bedroom", "beer", "behave", "before", "begin", "behind", "bell", "below",
  "besides", "best", "better", "between", "big", "bird", "birth", "birthday", "bit", "bite",
  "black", "bleed", "block", "blood", "blow", "blue", "board", "boat", "body", "boil",
  "bone", "book", "border", "born", "borrow", "both", "bottle", "bottom", "bowl", "box",
  "boy", "branch", "brave", "bread", "break", "breakfast", "breath", "breathe", "bridge", "bright",
  "bring", "brother", "brown", "brush", "build", "burn", "business", "bus", "busy", "but",
  "buy", "by", "cake", "call", "can", "candle", "cap", "car", "card", "care",
  "careful", "careless", "carry", "case", "cat", "catch", "central", "century", "certain", "chair",
  "chance", "change", "chase", "cheap", "cheese", "chicken", "child", "children", "chocolate", "choice",
  "choose", "circle", "city", "class", "clever", "clean", "clear", "climb", "clock", "cloth",
  "clothes", "cloud", "cloudy", "close", "coffee", "coat", "coin", "cold", "collect", "college",
  "color", "comb", "comfortable", "common", "compare", "come", "complete", "computer", "condition", "continue",
  "control", "cook", "cool", "copper", "corn", "corner", "correct", "cost", "contain", "count",
  "country", "course", "cover", "crash", "cross", "cry", "cup", "cupboard", "cut", "dance",
  "dangerous", "dark", "daughter", "day", "dead", "decide", "decrease", "deep", "deer", "depend",
  "desk", "destroy", "develop", "die", "different", "difficult", "dinner", "direction", "dirty", "discover",
  "dish", "do", "dog", "door", "double", "down", "draw", "dream", "dress", "drink",
  "drive", "drop", "dry", "duck", "dust", "duty", "each", "ear", "early", "earn",
  "earth", "east", "easy", "eat", "education", "effect", "egg", "eight", "either", "electric",
  "elephant", "else", "empty", "end", "enemy", "enjoy", "enough", "enter", "equal", "entrance",
  "escape", "even", "evening", "event", "ever", "every", "everyone", "exact", "everybody", "examination",
  "example", "except", "excited", "exercise", "expect", "expensive", "explain", "extremely", "eye", "face",
  "fact", "fail", "fall", "false", "family", "famous", "far", "farm", "father", "fast",
  "fat", "fault", "fear", "feed", "feel", "female", "fever", "few", "fight", "fill",
  "film", "find", "fine", "finger", "finish", "fire", "first", "fit", "five", "fix",
  "flag", "flat", "float", "floor", "flour", "flower", "fly", "fold", "food", "fool",
  "foot", "football", "for", "force", "foreign", "forest", "forget", "forgive", "fork", "form"
]

async function seedDictionary() {
  try {
    console.log('Starting to seed dictionary...')
    console.log(`Seeding dictionary using local database at ${API_URL}`)
    
    const response = await axios.post(`${API_URL}/dictionary/bulk`, {
      words: commonWords
    })
    
    console.log('Dictionary seeded successfully!')
    console.log(`${commonWords.length} words added to the database.`)
  } catch (error) {
    console.error('Error seeding dictionary:', error.message)
  }
}

// Run the seed function when this script is executed directly
if (require.main === module) {
  seedDictionary()
}

module.exports = { seedDictionary, commonWords }