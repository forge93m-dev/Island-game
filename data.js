// Answer data for Rare Ore.
// Each entry: "Display Name|rarity|alias,alias"
// rarity 1 = answer almost everyone gives ... 6 = answer almost nobody thinks of.

const TIERS = [
  null,
  { name: "Dirt",     pts: 10,  blocks: 1,  color: "#9b6a3b" },
  { name: "Coal",     pts: 25,  blocks: 3,  color: "#9a9a9a" },
  { name: "Iron",     pts: 40,  blocks: 4,  color: "#e2c0a0" },
  { name: "Gold",     pts: 60,  blocks: 6,  color: "#f5d742" },
  { name: "Diamond",  pts: 80,  blocks: 8,  color: "#5ef0ff" },
  { name: "Obsidian", pts: 100, blocks: 10, color: "#b26bff" },
];

// ---- Newest blocks, grouped by update (used for prompts + the guide panel) ----
const UPDATES = [
  {
    name: "Tricky Trials", version: "1.21", year: 2024, status: "released",
    blocks: [
      "Crafter|3", "Trial Spawner|3", "Vault|4|ominous vault", "Heavy Core|5",
      "Copper Bulb|3", "Copper Grate|4", "Copper Door|4", "Copper Trapdoor|5",
      "Chiseled Copper|5", "Tuff Bricks|4", "Polished Tuff|4", "Chiseled Tuff|5",
      "Chiseled Tuff Bricks|6",
    ],
  },
  {
    name: "The Garden Awakens", version: "1.21.4", year: 2024, status: "released",
    blocks: [
      "Pale Oak Log|2|pale oak,pale oak wood,pale oak planks", "Pale Oak Leaves|4",
      "Creaking Heart|2", "Pale Moss Block|3|pale moss", "Pale Moss Carpet|5",
      "Pale Hanging Moss|4|hanging moss", "Resin Block|3|resin", "Resin Bricks|4",
      "Chiseled Resin Bricks|5", "Resin Clump|5", "Eyeblossom|3|open eyeblossom,closed eyeblossom",
    ],
  },
  {
    name: "Spring to Life", version: "1.21.5", year: 2025, status: "released",
    blocks: [
      "Leaf Litter|3", "Wildflowers|3|wildflower", "Bush|5", "Firefly Bush|3",
      "Short Dry Grass|5|dry grass", "Tall Dry Grass|5", "Cactus Flower|4",
    ],
  },
  {
    name: "Chase the Skies", version: "1.21.6", year: 2025, status: "released",
    blocks: ["Dried Ghast|3"],
  },
  {
    name: "The Copper Age", version: "1.21.9", year: 2025, status: "released",
    blocks: [
      "Copper Chest|3", "Copper Golem Statue|4", "Copper Torch|3", "Copper Lantern|4",
      "Copper Bars|4", "Copper Chain|5", "Shelf|4|shelves,wooden shelf",
    ],
  },
  {
    name: "Chaos Cubed", version: "26.2", year: 2026, status: "released",
    blocks: [
      "Sulfur|2|sulfur block", "Polished Sulfur|4", "Sulfur Bricks|4", "Chiseled Sulfur|5",
      "Potent Sulfur|5", "Cinnabar|2|cinnabar block", "Polished Cinnabar|4",
      "Cinnabar Bricks|4", "Chiseled Cinnabar|5",
    ],
  },
  {
    name: "Wilderness Bound", version: "26.3", year: 2026, status: "released",
    blocks: [
      "Poplar Log|2|poplar,poplar wood,poplar planks", "Poplar Leaves|4",
      "Wool Stairs|3", "Wool Slab|3|wool slabs", "Concrete Stairs|4", "Concrete Slab|4|concrete slabs",
    ],
  },
  {
    name: "Deep Freeze", version: "26.4", year: 2026, status: "upcoming (preview)",
    blocks: ["Snow Bricks|3", "Packed Ice Bricks|4|ice bricks", "Polished Calcite|5|calcite bricks"],
  },
];

const NEW_BLOCKS = UPDATES.flatMap(u => u.blocks);
const BLOCKS_2026 = UPDATES.filter(u => u.year === 2026).flatMap(u => u.blocks);

const CLASSIC_BLOCKS = [
  "Dirt|1", "Stone|1", "Grass Block|1|grass", "Cobblestone|1|cobble", "Oak Planks|1|planks,wood,wooden planks",
  "Sand|1", "Gravel|2", "Glass|2", "Obsidian|2", "Diamond Block|2|block of diamond",
  "Crafting Table|1|workbench", "Furnace|2", "Chest|2", "TNT|2", "Bedrock|2",
  "Netherrack|3", "Glowstone|3", "Bookshelf|3", "Wool|2|white wool", "Bricks|3|brick",
  "Iron Block|3|block of iron", "Gold Block|3|block of gold", "Emerald Block|3|block of emerald",
  "Clay|3", "Ice|2", "Packed Ice|4", "Blue Ice|4", "Snow Block|3|snow",
  "Sandstone|3", "Red Sand|4", "Terracotta|3", "Concrete|3", "Concrete Powder|4",
  "Deepslate|3", "Cobbled Deepslate|4", "Tuff|4", "Calcite|5", "Dripstone Block|5",
  "Amethyst Block|4", "Budding Amethyst|5", "Moss Block|4|moss", "Mud|4", "Packed Mud|5", "Mud Bricks|5",
  "Prismarine|4", "Sea Lantern|4", "Sponge|3", "Wet Sponge|5", "Magma Block|4",
  "Soul Sand|3", "Soul Soil|5", "Basalt|4", "Blackstone|4", "Crying Obsidian|4",
  "Ancient Debris|3", "Netherite Block|3|block of netherite", "Quartz Block|4|block of quartz",
  "End Stone|3", "Purpur Block|4|purpur", "End Rod|5", "Shulker Box|4",
  "Beacon|3", "Anvil|3", "Enchanting Table|2", "Brewing Stand|4", "Cauldron|4",
  "Hopper|3", "Dispenser|4", "Dropper|4", "Observer|4", "Piston|3", "Sticky Piston|4",
  "Redstone Block|4|block of redstone", "Lapis Block|4|block of lapis lazuli", "Coal Block|4|block of coal",
  "Slime Block|3", "Honey Block|4", "Honeycomb Block|5", "Bee Nest|4", "Beehive|4",
  "Hay Bale|4|hay block", "Pumpkin|3", "Carved Pumpkin|4", "Jack o'Lantern|4|jack o lantern",
  "Melon|3", "Cactus|3", "Sugar Cane|3", "Bamboo|4", "Bamboo Block|5",
  "Mycelium|4", "Podzol|4", "Coarse Dirt|4", "Rooted Dirt|5", "Dirt Path|5|grass path",
  "Farmland|4", "Sculk|4", "Sculk Sensor|4", "Sculk Shrieker|4", "Sculk Catalyst|5",
  "Reinforced Deepslate|5", "Target|5|target block", "Lodestone|5", "Respawn Anchor|4",
  "Barrel|4", "Smoker|4", "Blast Furnace|4", "Loom|5", "Cartography Table|5", "Fletching Table|5",
  "Smithing Table|4", "Stonecutter|5", "Grindstone|5", "Composter|5", "Lectern|5", "Bell|5",
  "Campfire|4", "Soul Campfire|5", "Lantern|4", "Torch|2", "Ladder|4", "Scaffolding|4",
  "Bed|3", "Jukebox|4", "Note Block|4", "Spawner|4|monster spawner", "End Portal Frame|4",
  "Dragon Egg|4", "Conduit|5", "Chiseled Bookshelf|5", "Decorated Pot|5", "Suspicious Sand|5",
  "Suspicious Gravel|6", "Sniffer Egg|5", "Pitcher Plant|6", "Torchflower|5",
  "Cherry Log|4|cherry,cherry wood,cherry planks", "Mangrove Log|4|mangrove", "Calibrated Sculk Sensor|6",
  "Frogspawn|6", "Ochre Froglight|6|froglight", "Verdant Froglight|6", "Pearlescent Froglight|6",
  "Shroomlight|5", "Nether Wart Block|5", "Warped Wart Block|6", "Crimson Nylium|5", "Warped Nylium|5",
  "Gilded Blackstone|5", "Chiseled Stone Bricks|5", "Stone Bricks|3", "Mossy Cobblestone|4",
  "Infested Stone|6|silverfish block", "Smooth Stone|4", "Andesite|4", "Diorite|3", "Granite|3",
  "Copper Block|3|block of copper", "Oxidized Copper|4", "Raw Iron Block|5|block of raw iron",
  "Barrier|5", "Command Block|4", "Structure Block|6", "Jigsaw Block|6", "Light Block|6",
];

const ORES = [
  "Diamond Ore|1|diamond", "Iron Ore|1|iron", "Coal Ore|1|coal", "Gold Ore|1|gold",
  "Redstone Ore|2|redstone", "Lapis Lazuli Ore|2|lapis,lapis ore", "Emerald Ore|2|emerald",
  "Copper Ore|3|copper", "Nether Quartz Ore|3|quartz ore,quartz", "Nether Gold Ore|4",
  "Ancient Debris|3|netherite", "Deepslate Diamond Ore|4", "Deepslate Iron Ore|5",
  "Deepslate Emerald Ore|6", "Deepslate Copper Ore|6", "Deepslate Coal Ore|6",
  "Deepslate Gold Ore|5", "Deepslate Redstone Ore|5", "Deepslate Lapis Lazuli Ore|5|deepslate lapis ore",
  "Gilded Blackstone|6",
];

const HOSTILE_MOBS = [
  "Zombie|1", "Creeper|1", "Skeleton|1", "Spider|1", "Enderman|2",
  "Witch|2", "Slime|3", "Blaze|3", "Ghast|3", "Phantom|3", "Drowned|3",
  "Husk|4", "Stray|4", "Cave Spider|3", "Silverfish|4", "Endermite|5",
  "Guardian|4", "Elder Guardian|4", "Shulker|4", "Wither Skeleton|3",
  "Magma Cube|4", "Hoglin|4", "Zoglin|5", "Piglin Brute|5", "Pillager|3",
  "Vindicator|4", "Evoker|4", "Vex|4", "Ravager|4", "Warden|2",
  "Breeze|4", "Bogged|5", "Creaking|4", "Zombie Villager|4", "Ender Dragon|2|dragon",
  "Wither|2", "Parched|6", "Camel Husk|6", "Illusioner|6", "Giant|6", "Sulfur Cube|5",
];

const PASSIVE_MOBS = [
  "Cow|1", "Pig|1", "Sheep|1", "Chicken|1", "Horse|2", "Villager|2",
  "Cat|2", "Wolf|2|dog", "Rabbit|3", "Fox|3", "Parrot|3", "Axolotl|3",
  "Bee|3", "Frog|3", "Turtle|3", "Llama|4", "Panda|3", "Donkey|4", "Mule|4",
  "Squid|4", "Glow Squid|5", "Dolphin|4", "Goat|4", "Camel|4", "Sniffer|4",
  "Armadillo|4", "Allay|4", "Strider|5", "Mooshroom|4|mushroom cow", "Ocelot|5",
  "Bat|4", "Cod|5", "Salmon|5", "Tropical Fish|5", "Pufferfish|5", "Tadpole|6",
  "Polar Bear|4", "Wandering Trader|5", "Trader Llama|6", "Skeleton Horse|6",
  "Zombie Horse|6", "Snow Golem|4", "Iron Golem|3", "Happy Ghast|4", "Copper Golem|4",
  "Nautilus|5", "Sniffer|5",
];

const BIOMES = [
  "Plains|1", "Desert|1", "Forest|1", "Jungle|2", "Taiga|2", "Ocean|2", "Savanna|2",
  "Swamp|2", "Badlands|3|mesa", "Mushroom Fields|3|mushroom island", "Birch Forest|3",
  "Dark Forest|3|roofed forest", "Snowy Plains|3|tundra", "Ice Spikes|4", "Beach|3",
  "River|3", "Meadow|4", "Cherry Grove|3", "Mangrove Swamp|4", "Lush Caves|3",
  "Dripstone Caves|4", "Deep Dark|3", "Jagged Peaks|5", "Frozen Peaks|5", "Stony Peaks|5",
  "Snowy Slopes|5", "Grove|5", "Windswept Hills|5|extreme hills", "Sunflower Plains|5",
  "Flower Forest|4", "Old Growth Pine Taiga|5|mega taiga", "Old Growth Spruce Taiga|6",
  "Old Growth Birch Forest|6", "Bamboo Jungle|4", "Sparse Jungle|6", "Eroded Badlands|5",
  "Wooded Badlands|6", "Savanna Plateau|5", "Windswept Savanna|6", "Frozen River|5",
  "Stony Shore|6", "Snowy Beach|6", "Warm Ocean|4", "Lukewarm Ocean|5", "Cold Ocean|5",
  "Frozen Ocean|5", "Deep Ocean|4", "Deep Frozen Ocean|6", "Snowy Taiga|4",
  "Windswept Forest|6", "Windswept Gravelly Hills|6", "Pale Garden|3", "Sulfur Caves|4",
  "Dappled Forest|4", "Nether Wastes|4", "Crimson Forest|4", "Warped Forest|4",
  "Soul Sand Valley|4", "Basalt Deltas|5", "The End|4|end", "End Highlands|6", "Small End Islands|6",
];

const ENCHANTMENTS = [
  "Sharpness|1", "Protection|1", "Efficiency|1", "Unbreaking|1", "Fortune|2",
  "Mending|1", "Silk Touch|2", "Looting|2", "Fire Aspect|2", "Power|3",
  "Infinity|3", "Flame|3", "Punch|4", "Knockback|3", "Smite|3",
  "Bane of Arthropods|4", "Sweeping Edge|5", "Feather Falling|3", "Respiration|4",
  "Aqua Affinity|4", "Depth Strider|4", "Frost Walker|4", "Thorns|3",
  "Fire Protection|4", "Blast Protection|4", "Projectile Protection|4",
  "Soul Speed|5", "Swift Sneak|5", "Luck of the Sea|5", "Lure|5",
  "Loyalty|4", "Riptide|4", "Channeling|4", "Impaling|5", "Multishot|4",
  "Piercing|5", "Quick Charge|4", "Density|5", "Breach|5", "Wind Burst|5",
  "Curse of Binding|5|binding curse", "Curse of Vanishing|5|vanishing curse", "Lunge|6",
];

const FOODS = [
  "Steak|1|cooked beef", "Bread|1", "Apple|1", "Golden Apple|2|gapple", "Carrot|2",
  "Cooked Porkchop|2|porkchop", "Cooked Chicken|2", "Potato|3", "Baked Potato|2",
  "Cookie|3", "Cake|3", "Pumpkin Pie|3", "Melon Slice|3|melon", "Golden Carrot|2",
  "Enchanted Golden Apple|3|notch apple", "Mushroom Stew|4", "Rabbit Stew|4",
  "Beetroot|4", "Beetroot Soup|5", "Suspicious Stew|5", "Cooked Mutton|3|mutton",
  "Cooked Cod|4|cod", "Cooked Salmon|4|salmon", "Cooked Rabbit|5", "Rotten Flesh|3",
  "Spider Eye|5", "Poisonous Potato|5", "Sweet Berries|3", "Glow Berries|4",
  "Honey Bottle|4", "Chorus Fruit|4", "Dried Kelp|4", "Tropical Fish|6", "Pufferfish|5",
  "Raw Beef|5", "Raw Chicken|5", "Milk Bucket|5|milk",
];

const MOBS_RECENT = [ // added 1.19 or later
  "Warden|1", "Allay|2", "Frog|2", "Tadpole|5", "Camel|2", "Sniffer|2",
  "Armadillo|3", "Breeze|2", "Bogged|3", "Creaking|2", "Happy Ghast|2",
  "Copper Golem|3", "Nautilus|4", "Zombie Nautilus|5", "Camel Husk|5", "Parched|5",
  "Sulfur Cube|3", "Ghastling|5",
];

const COPPER_THINGS = [
  "Copper Ingot|1", "Copper Block|1|block of copper", "Copper Ore|1",
  "Lightning Rod|2", "Spyglass|3", "Copper Bulb|2", "Copper Grate|3",
  "Copper Door|3", "Copper Trapdoor|4", "Chiseled Copper|4", "Cut Copper|3",
  "Oxidized Copper|3", "Exposed Copper|4", "Weathered Copper|4", "Waxed Copper|4",
  "Raw Copper|3", "Copper Golem|2", "Copper Chest|3", "Copper Torch|3",
  "Copper Lantern|4", "Copper Bars|4", "Copper Chain|5", "Copper Golem Statue|5",
  "Copper Sword|3", "Copper Pickaxe|4", "Copper Helmet|4", "Copper Chestplate|5",
  "Copper Nugget|5", "Brush|5",
];

const PLANTS = [
  "Poppy|1|rose", "Dandelion|1", "Sunflower|2", "Tulip|2|red tulip,orange tulip,white tulip,pink tulip",
  "Blue Orchid|3", "Allium|3", "Azure Bluet|4", "Oxeye Daisy|3", "Cornflower|3",
  "Lily of the Valley|3", "Wither Rose|3", "Lilac|4", "Rose Bush|4", "Peony|4",
  "Torchflower|4", "Pitcher Plant|5", "Spore Blossom|4", "Pink Petals|4", "Eyeblossom|4",
  "Wildflowers|4", "Cactus Flower|5", "Firefly Bush|5", "Lily Pad|4", "Fern|4",
  "Dead Bush|4", "Azalea|4", "Flowering Azalea|5", "Big Dripleaf|5", "Small Dripleaf|6",
  "Chorus Flower|5", "Crimson Fungus|5", "Warped Fungus|5", "Sea Pickle|5", "Kelp|4",
  "Seagrass|5", "Vines|3|vine", "Glow Lichen|5", "Sweet Berry Bush|5",
  "Closed Eyeblossom|6", "Mangrove Propagule|6", "Hanging Roots|6", "Bush|6", "Short Grass|5|grass",
];

const WOOD_TYPES = [
  "Oak|1", "Birch|1", "Spruce|1", "Jungle|2", "Acacia|2", "Dark Oak|2",
  "Cherry|3", "Mangrove|3", "Bamboo|4", "Crimson|4", "Warped|4", "Pale Oak|3",
  "Poplar|4",
];

const EFFECTS = [
  "Speed|1|swiftness", "Strength|1", "Regeneration|1", "Poison|2", "Invisibility|2",
  "Night Vision|2", "Fire Resistance|2", "Jump Boost|3|leaping", "Slowness|3",
  "Weakness|3", "Water Breathing|3", "Wither|3", "Haste|3", "Resistance|4",
  "Absorption|4", "Health Boost|5", "Saturation|5", "Hunger|4", "Nausea|4",
  "Blindness|4", "Mining Fatigue|4", "Levitation|4", "Glowing|5", "Luck|5", "Bad Luck|6|unluck",
  "Slow Falling|4", "Conduit Power|5", "Dolphin's Grace|5|dolphins grace", "Bad Omen|5",
  "Hero of the Village|5", "Darkness|5", "Trial Omen|6", "Raid Omen|6", "Wind Charged|6",
  "Weaving|6", "Oozing|6", "Infested|6", "Instant Health|4|healing", "Instant Damage|5|harming",
];

const REDSTONE = [
  "Redstone Dust|1|redstone,redstone wire", "Redstone Torch|1", "Lever|1", "Piston|1",
  "Repeater|2|redstone repeater", "Comparator|2|redstone comparator", "Button|2|stone button,wooden button",
  "Pressure Plate|2", "Sticky Piston|2", "Observer|2", "Hopper|3", "Dispenser|3",
  "Dropper|3", "Redstone Lamp|3", "Daylight Detector|4|daylight sensor", "Tripwire Hook|4|tripwire",
  "Target|5", "Note Block|4", "Trapped Chest|4", "Sculk Sensor|4", "Calibrated Sculk Sensor|5",
  "Crafter|3", "Copper Bulb|4", "Lightning Rod|5", "Redstone Block|3|block of redstone",
  "Lectern|6", "TNT|4", "Rail|4|powered rail,activator rail,detector rail", "Weighted Pressure Plate|5",
  "Slime Block|4", "Honey Block|5", "Shelf|6",
];

const TOOLS_WEAPONS = [
  "Diamond Sword|1|sword", "Pickaxe|1|diamond pickaxe,iron pickaxe", "Bow|1", "Axe|2",
  "Shovel|2", "Hoe|3", "Crossbow|2", "Trident|2", "Shield|3", "Mace|2",
  "Fishing Rod|3", "Flint and Steel|3", "Shears|4", "Spyglass|4", "Brush|4",
  "Compass|4", "Clock|5", "Lead|5", "Netherite Sword|2", "Spear|4", "Wind Charge|5",
  "Fire Charge|5", "Snowball|5", "Egg|6", "Ender Pearl|4", "Splash Potion|5",
  "Carrot on a Stick|5", "Warped Fungus on a Stick|6", "Bucket|4", "Elytra|5", "Totem of Undying|5|totem",
];

const STRUCTURES = [
  "Village|1", "Stronghold|1", "Nether Fortress|2|fortress", "Desert Temple|2|desert pyramid",
  "Jungle Temple|3", "Woodland Mansion|2|mansion", "Ocean Monument|2|monument",
  "End City|2", "Bastion Remnant|3|bastion", "Ancient City|2", "Shipwreck|3",
  "Mineshaft|2|abandoned mineshaft", "Pillager Outpost|3|outpost", "Ruined Portal|3",
  "Igloo|4", "Witch Hut|4|swamp hut", "Dungeon|3", "Buried Treasure|4", "Ocean Ruins|4",
  "Trail Ruins|4", "Trial Chambers|3|trial chamber", "Desert Well|5", "Fossil|5",
  "Abandoned Camp|6", "Nether Fossil|6", "End Gateway|6", "Amethyst Geode|5|geode",
];

// The prompts. `answers` is the list of valid answers for that prompt.
const PROMPTS = [
  { q: "Name any block", answers: [...CLASSIC_BLOCKS, ...NEW_BLOCKS.map(bump)], tag: "Blocks" },
  { q: "Name a block added in 2024 or later", answers: NEW_BLOCKS, tag: "New blocks" },
  { q: "Name a block added in a 2026 update", answers: BLOCKS_2026, tag: "New blocks" },
  { q: "Name a block from the 2025 Copper Age or Spring to Life drops",
    answers: UPDATES.filter(u => u.name === "The Copper Age" || u.name === "Spring to Life").flatMap(u => u.blocks), tag: "New blocks" },
  { q: "Name a Tricky Trials (1.21) block", answers: UPDATES[0].blocks, tag: "New blocks" },
  { q: "Name an ore (or ore variant)", answers: ORES, tag: "Blocks" },
  { q: "Name a hostile or boss mob", answers: HOSTILE_MOBS, tag: "Mobs" },
  { q: "Name a passive or neutral mob", answers: PASSIVE_MOBS, tag: "Mobs" },
  { q: "Name a mob added in 1.19 or later", answers: MOBS_RECENT, tag: "Mobs" },
  { q: "Name a biome", answers: BIOMES, tag: "Biomes" },
  { q: "Name an enchantment", answers: ENCHANTMENTS, tag: "Enchantments" },
  { q: "Name a food you can eat", answers: FOODS, tag: "Items" },
  { q: "Name something made of copper", answers: COPPER_THINGS, tag: "Copper" },
  { q: "Name a flower or plant", answers: PLANTS, tag: "Plants" },
  { q: "Name a wood type", answers: WOOD_TYPES, tag: "Blocks" },
  { q: "Name a status effect", answers: EFFECTS, tag: "Effects" },
  { q: "Name a redstone component", answers: REDSTONE, tag: "Redstone" },
  { q: "Name a tool, weapon or useful item", answers: TOOLS_WEAPONS, tag: "Items" },
  { q: "Name a generated structure", answers: STRUCTURES, tag: "Structures" },
];

// New blocks are rarer answers to the generic "any block" prompt.
function bump(entry) {
  const [name, r, alias] = entry.split("|");
  return [name, Math.min(6, Number(r) + 1), alias || ""].join("|");
}
