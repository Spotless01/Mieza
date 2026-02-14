// ===============================
// MIEZA — SHOPS DATA
// ===============================

const shops = [
  {
    id: "shop1",
    name: "Downtown Café",
    thumbnail: "images/downtown-cafe.jpg",
    openingHours: { open: "07:00", close: "23:00" },
    products: [
      { id: 101, name: "Cappuccino", price: 15, image: "images/cappuccino.jpg" },
      { id: 102, name: "Croissant", price: 8, image: "images/croissant.jpg" },
    ],
  },
  {
    id: "shop2",
    name: "Night Owl Pizza",
    thumbnail: "images/night-owl.jpg",
    openingHours: { open: "18:00", close: "02:00" }, // next-day closing
    products: [
      { id: 201, name: "Margherita", price: 25, image: "images/margherita.jpg" },
      { id: 202, name: "Pepperoni", price: 28, image: "images/pepperoni.jpg" },
    ],
  },
  {
    id: "nana-odo-mmra",
    name: "Nana Odo Mmra",
    thumbnail: "images/shops/nana_odo_mmra.jpeg",
    openingHours: { open: "00:00", close: "23:59" }, // always open
    products: [
      { id: 1, name: "Assorted Jollof Rice", price: 60, image: "images/products/nana_odo_mmra/assorted_jollof_rice.jpg" },
      { id: 2, name: "Fufu, Goat Soup and Light Soup", price: 70, image: "images/products/nana_odo_mmra/fufu_with_goat_soup.jpg" },
      { id: 3, name: "Palava Sauce", price: 60, image: "images/products/nana_odo_mmra/palava_sauce.jpg" },
      { id: 4, name: "Tuo Zaafi an Mixed Meat", price: 60, image: "images/products/nana_odo_mmra/tuo_zaafi.jpeg" },
      { id: 5, name: "Kenkey and Chicken", price: 50, image: "images/products/nana_odo_mmra/kenkey_and_chicken.jpg" },
      { id: 6, name: "Kenkey and Fried Fish", price: 50, image: "images/products/nana_odo_mmra/kenkey_and_fried_fish.jpg" },
      { id: 7, name: "Waakye and Chicken and Wele", price: 50, image: "images/products/nana_odo_mmra/waakye.jpeg" },
      { id: 8, name: "Waakye and Fish and Wele", price: 50, image: "images/products/nana_odo_mmra/waakye.jpeg" },
      { id: 9, name: "Banku and Okro Soup", price: 60, image: "images/products/nana_odo_mmra/banku_and _okro_soup.jpg" },
      { id: 10, name: "Rice Ball and Groundnut Soup", price: 50, image: "images/products/nana_odo_mmra/rice_ball.jpg" },
      { id: 11, name: "Banku with Tilapia", price: 60, image: "images/products/nana_odo_mmra/banku_with_tilapia.webp " },
      { id: 12, name: "Eba with Agusi Stew", price: 50, image: "images/products/nana_odo_mmra/eba_with_agusi_stew.jpg" },
      { id: 13, name: "Yam, Plantain an Garden Egg Stew", price: 50, image: "images/products/nana_odo_mmra/yam_plantain_and_garden_egg_stew.jpg " },
      { id: 14, name: "Fufu with Abunuabunu", price: 70, image: "images/products/nana_odo_mmra/fufu_with_abunuabunu.webp" },
      { id: 15, name: "Chicken Noodles", price: 50, image: "images/products/nana_odo_mmra/chicken_noodles.webp" },
      { id: 16, name: "Beef Noodles", price: 50, image: "images/products/nana_odo_mmra/beef_noodles.jpg" },     
      { id: 17, name: "Ghana Salad", price: 50, image: "images/products/nana_odo_mmra/ghana_salad.jpg" },     
      { id: 18, name: "Beef Vegetable Sauce", price: 70, image: "images/products/nana_odo_mmra/beef_vegetable_sauce.jpg" },     
      { id: 19, name: "Fried Rice with Beef", price: 50, image: "images/products/nana_odo_mmra/fried_rice_with_beef.jpg" },          
      { id: 20, name: "Chicken Sauce", price: 70, image: "images/products/nana_odo_mmra/chicken_sauce.jpg" },     
      { id: 21, name: "Vegetable Rice with Chicken", price: 80, image: "images/products/nana_odo_mmra/vegetable_rice_with_chicken.jpg" },     
      { id: 22, name: "Jollof Rice with Chicken", price: 70, image: "images/products/nana_odo_mmra/jollof_rice_with_chicken.jpg" },     
      { id: 23, name: "Fried Yam and Chicken", price: 50, image: "images/products/nana_odo_mmra/fried_yam_and_chicken.jpg" },     
      { id: 24, name: "Cury Vegetable Rice", price: 80, image: "images/products/nana_odo_mmra/curry_vegetable_rice.jpg" },     
      { id: 25, name: "Beef Vegetable Rice", price: 80, image: "images/products/nana_odo_mmra/beef_vegetable_rice.jpg" },     
      { id: 26, name: "Chicken Vegetable Fried Rice", price: 60, image: "images/products/nana_odo_mmra/chicken_vegetable_fried_rice.jpg" },  
      { id: 27, name: "Assorted Noodles", price: 80, image: "images/products/nana_odo_mmra/assorted_noodles.jpg" }   
    ],
  },
  {
    id: "shop4",
    name: "Early Bird Bakery",
    thumbnail: "images/early-bird.jpg",
    openingHours: { open: "05:00", close: "12:00" }, // morning only
    products: [
      { id: 401, name: "Bagel", price: 5, image: "images/bagel.jpg" },
      { id: 402, name: "Muffin", price: 7, image: "images/muffin.jpg" },
    ],
  },
];
