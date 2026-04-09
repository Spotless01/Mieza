const shops = [
  {
    id: "gracious-classic",
    name: "Gracious Classic Fabric Hub (Dome)",
    category: "Fashion 🧵",
    thumbnail: "images/shops/gracious_classic.jpg",
    deliveryTime: "less than 30 mins",
    deliveryFee: 10,
    openingHours: { open: "08:00", close: "21:59" },
    products: [
      {
        id: 36,
        name: "Avetos Ethic Sandals",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe11.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe11.jpg"
        ]
      },
      {
        id: 30,
        name: "Avetos Loafer Shoe for men",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe1.jpg",
        description: "Size 41 -45",
        images: [
          "images/products/gracious_classic_fabric/shoe1.jpg"
        ]
      },
      {
        id: 1,
        name: "Esterica Print",
        price: 500,
        image: "images/products/gracious_classic_fabric/cloth1.png",
        description: "6 yards",
        images: [
          "images/products/gracious_classic_fabric/cloth1.png"
        ]
      },
      {
        id: 2,
        name: "Esterica Print",
        price: 500,
        image: "images/products/gracious_classic_fabric/cloth2.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth2.png"
        ]
      },
      {
        id: 31,
        name: "Mantaray hiking boots",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe2.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe2.jpg"
        ]
      },
      {
        id: 3,
        name: "Esterica Print",
        price: 500,
        image: "images/products/gracious_classic_fabric/cloth3.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth3.png"
        ]
      },
      {
        id: 37,
        name: "Double Monk Strap",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe10.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe10.jpg"
        ]
      },
      {
        id: 4,
        name: "Esterica Print",
        price: 500,
        image: "images/products/gracious_classic_fabric/cloth4.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth4.png"
        ]
      },
      {
        id: 32,
        name: "Mantaray Tay leather boot",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe3.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe3.jpg"
        ]
      },
      {
        id: 5,
        name: "Esterica Print",
        price: 500,
        image: "images/products/gracious_classic_fabric/cloth5.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth5.png"
        ]
      },
      {
        id: 6,
        name: "Esterica Print",
        price: 500,
        image: "images/products/gracious_classic_fabric/cloth6.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth6.png"
        ]
      },
      {
        id: 38,
        name: "Casual Sneaker",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe9.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe9.jpg"
        ]
      },
      {
        id: 7,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth7.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth7.jpg"
        ]
      },
      {
        id: 8,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth8.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth8.jpg"
        ]
      },
      {
        id: 43,
        name: "Alko Plus APS Shoe",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe13.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe13.jpg"
        ]
      },
      {
        id: 9,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth9.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth9.jpg"
        ]
      },

      {
        id: 10,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth10.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth10.jpg"
        ]
      },
      {
        id: 39,
        name: "Avetos Ethic Sandals",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe8.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe8.jpg"
        ]
      },
      {
        id: 11,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth11.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth11.jpg"
        ]
      },
      {
        id: 12,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth12.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth12.jpg"
        ]
      },
      {
        id: 13,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth13.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth13.jpg"
        ]
      },
      {
        id: 14,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth14.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth14.jpg"
        ]
      },
      {
        id: 15,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth15.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth15.jpg"
        ]
      },
      {
        id: 40,
        name: "Black Shoe",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe7.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe7.jpg"
        ]
      },
      {
        id: 16,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth16.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth16.jpg"
        ]
      },
      {
        id: 18,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth18.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth18.jpg"
        ]
      },
      {
        id: 19,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth19.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth19.jpg"
        ]
      },
      {
        id: 35,
        name: "Black Chunky Loafer",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe12.jpg",
        description: "Size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe12.jpg"
        ]
      },
      {
        id: 20,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth20.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth20.jpg"
        ]
      },
      {
        id: 41,
        name: "Black Shoe",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe7.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe7.jpg"
        ]
      },
      {
        id: 21,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth21.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth21.jpg"
        ]
      },
      {
        id: 22,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth22.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth22.jpg"
        ]
      },
      {
        id: 23,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth23.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth23.jpg"
        ]
      },
      {
        id: 24,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth24.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth24.jpg"
        ]
      },
      {
        id: 42,
        name: "Mens's Derby Brogue",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe6.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe6.jpg"
        ]
      },
      {
        id: 25,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth25.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth25.jpg"
        ]
      },
      {
        id: 26,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth26.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth26.jpg"
        ]
      },
      {
        id: 27,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth27.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth27.jpg"
        ]
      },
      {
        id: 28,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth28.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth28.jpg"
        ]
      },
      {
        id: 29,
        name: "Esterica Print",
        price: 350,
        image: "images/products/gracious_classic_fabric/cloth29.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth29.jpg"
        ]
      },
      {
        id: 33,
        name: "Thomas Crick Clayton loafers",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe4.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe4.jpg"
        ]
      },
      {
        id: 34,
        name: "Mantaray Tay leather boot",
        price: 550,
        image: "images/products/gracious_classic_fabric/shoe5.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe5.jpg"
        ]
      },
      
    ],

    feedback: []
  },
  




  {
  id: "sneaker-factory",
  name: "Sneaker Factory (Tantra Hill)",
  category: "Footwear 👟",
  thumbnail: "images/shops/sneaker-factory.jpg",
  deliveryTime: "30 - 60 mins",
  deliveryFee: 15,
  openingHours: { open: "09:00", close: "22:00" },

  products: [
    {
      id: 1,
      name: "Adidas Campus Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe1.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe1.jpg"
      ]
    },
    {
      id: 2,
      name: "Puma Suede Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe2.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe2.jpg"
      ]
    },
    {
      id: 3,
      name: "Nike Air Jordan 11 Retro Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe3.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe3.jpg"
      ]
    },
    {
      id: 4,
      name: "Timberland Mens",
      price: 410,
      image: "images/products/sneaker-factory/shoe4.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe4.jpg"
      ]
    },
    {
      id: 5,
      name: "ASICS GEL-1130 Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe5.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe5.jpg"
      ]
    },
    {
      id: 6,
      name: "New Balance 2002R",
      price: 410,
      image: "images/products/sneaker-factory/shoe6.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe6.jpg"
      ]
    },
    {
      id: 7,
      name: "Worksout X Nike Air Max 95",
      price: 410,
      image: "images/products/sneaker-factory/shoe7.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe7.jpg"
      ]
    },
    {
      id: 8,
      name: "New Balance 530 Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe8.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe8.jpg"
      ]
    },
    {
      id: 9,
      name: "Vans Knu Skool Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe9.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe9.jpg"
      ]
    },
    {
      id: 10,
      name: "Nike Air Force 1 Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe10.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe10.jpg"
      ]
    },
    {
      id: 11,
      name: "Adidas Samba OG Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe11.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe11.jpg"
      ]
    },
    {
      id: 12,
      name: "Nike Air Max 90",
      price: 410,
      image: "images/products/sneaker-factory/shoe12.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe12.jpg"
      ]
    },
    {
      id: 13,
      name: "Adidas Gazelle",
      price: 410,
      image: "images/products/sneaker-factory/shoe13.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe13.jpg"
      ]
    },
    {
      id: 14,
      name: "Nike Shox TL Neymah Jr. black and gold Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe14.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe14.jpg"
      ]
    },
    {
      id: 15,
      name: "Nike Air Jordan 11 Retro",
      price: 410,
      image: "images/products/sneaker-factory/shoe15.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe15.jpg"
      ]
    },
    {
      id: 16,
      name: "New Balance 8040 Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe16.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe16-copy.jpg"
      ]
    },
    {
      id: 17,
      name: "New Balance 2002R Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe17.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe17.jpg"
      ]
    },
    {
      id: 18,
      name: "Nike Air Jordan 9 Retro",
      price: 410,
      image: "images/products/sneaker-factory/shoe18.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe18.jpg"
      ]
    },
    {
      id: 19,
      name: "Converse Run Star Legacy CX Top Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe19.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe19.jpg"
      ]
    },
    {
      id: 20,
      name: "Dr. Martens 1461 Quad Shoe",
      price: 470,
      image: "images/products/sneaker-factory/shoe20.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe20.jpg"
      ]
    },
    {
      id: 21,
      name: "Puma Club II Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe21.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe21.jpg"
      ]
    },
    {
      id: 22,
      name: "Nike SB Dunk Low Tweed Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe22.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe22.jpg"
      ]
    },
    {
      id: 23,
      name: "New Balance ABZORB 2000",
      price: 410,
      image: "images/products/sneaker-factory/shoe23.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe23.jpg"
      ]
    },
    {
      id: 24,
      name: "Air Jordan 4 Sneaker",
      price: 410,
      image: "images/products/sneaker-factory/shoe24.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe24.jpg"
      ]
    },
    {
      id: 25,
      name: "New Balance 9060",
      price: 410,
      image: "images/products/sneaker-factory/shoe25.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe25.jpg"
      ]
    },
    {
      id: 26,
      name: "Nike Air Force Sneakers",
      price: 410,
      image: "images/products/sneaker-factory/shoe26.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe26-copy.jpg"
      ]
    },
    {
      id: 27,
      name: "Nike Air Force 1",
      price: 410,
      image: "images/products/sneaker-factory/shoe27.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe27.jpg"
      ]
    },
    {
      id: 28,
      name: "Black Patent Nike Air Force Sneakers",
      price: 410,
      image: "images/products/sneaker-factory/shoe28.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe28.jpg"
      ]
    },
    {
      id: 29,
      name: "Whole Sale Purchases",
      price: 410 - 500,
      image: "images/products/sneaker-factory/shoe29.jpg",
      description: "Available sizes: 38 - 45",
      images: [
        "images/products/sneaker-factory/shoe29.jpg"
      ]
    },    
  ],

  feedback: []
},





{
  id: "still-flavour-world-catering-service",
  name: "Still Flavour World Catering Service (Dome)",
  category: "Food 🍔",
  thumbnail: "images/shops/still-flavour-world-catering-service.jpg",
  deliveryTime: "30 - 60 mins",
  deliveryFee: 15,
  openingHours: { open: "09:00", close: "22:00" },

  products: [
    {
      id: 1,
      name: "Waakye",
      price: 15,
      image: "images/products/still-flavour-world-catering-service/waakye.jpg",
      description: "With any amount, you can get a plate of waakye with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/waakye.jpg"
      ]
    },
    {
      id: 2,
      name: "Chips",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/chips.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/chips.jpg"
      ]
    },
    {
      id: 3,
      name: "Plain Rice",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/plainrice.jpg",
      description: "With any amount, you can get a plate of plain rice with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/plainrice.jpg"
      ]
    },
    {
      id: 4,
      name: "Ampesi",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/ampesi.jpeg",
      description: "With any amount, you can get a plate of ampesi with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/ampesi.jpeg"
      ]
    },
    {
      id: 5,
      name: "Spring Rolls",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/springrolls.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/springrolls.jpg"
      ]
    },
    {
      id: 6,
      name: "Samosa",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/samosa.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/samosa.jpg"
      ]
    },
    {
      id: 7,
      name: "Cake",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/cake.avif",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/cake.avif"
      ]
    },
    {
      id: 8,
      name: "Fried Rice",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/friedrice.jpg",
      description: "With any amount, you can get a plate of fried rice with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/friedrice.jpg"
      ]
    },
    {
      id: 9,
      name: "Jollof Rice",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/jollof.jpg",
      description: "With any amount, you can get a plate of jollof rice with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/jollof.jpg"
      ]
    },
    {
      id: 10,
      name: "Meat Pie",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/pie.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/pie.jpg"
      ]
    },
    
    {
      id: 11,
      name: "Banku and Okro Stew",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/banku.jpg",
      description: "With any amount, you can get a plate of banku and okro stew with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/banku.jpg"
      ]
    },
    {
      id: 12,
      name: "Atwemo",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/atwemo.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/atwemo.jpg"
      ]
    },
    {
      id: 13,
      name: "Rough Buns",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/rough-buns.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/rough-buns.jpg"
      ]
    },
    
    ],

  feedback: []
},





{
  id: "pedicks-food-bay",
  name: " Pedicks Food Bay (Dome)",
  category: "Food 🍔",
  thumbnail: "images/shops/pedicks-food-bay.jpg",
  deliveryTime: "30 - 60 mins",
  deliveryFee: 15,
  openingHours: { open: "08:00", close: "22:00" },

  products: [
      {
      id: 1,
      name: "Waakye",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/waakye.jpg",
      description: "With any amount, you can get a plate of waakye with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/waakye.jpg"
      ]
    },
    {
      id: 2,
      name: "Chips",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/chips.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/chips.jpg"
      ]
    },
    {
      id: 14,
      name: "Fufu",
      price: 10,
      image: "images/products/pedicks-food-bay/fufu.jpg",
      description: "With any amount, you can get a bowl of fufu with your choice of sides and protein.",
      images: [
        "images/products/pedicks-food-bay/fufu.jpg"
      ]
    },
    {
      id: 3,
      name: "Plain Rice",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/plainrice.jpg",
      description: "With any amount, you can get a plate of plain rice with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/plainrice.jpg"
      ]
    },
    {
      id: 4,
      name: "Ampesi",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/ampesi.jpeg",
      description: "With any amount, you can get a plate of ampesi with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/ampesi.jpeg"
      ]
    },
    {
      id: 5,
      name: "Spring Rolls",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/springrolls.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/springrolls.jpg"
      ]
    },
    {
      id: 6,
      name: "Samosa",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/samosa.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/samosa.jpg"
      ]
    },
    {
      id: 7,
      name: "Cake",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/cake.avif",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/cake.avif"
      ]
    },
    {
      id: 15,
      name: "Kokonte",
      price: 10,
      image: "images/products/pedicks-food-bay/kokonte.jpg",
      description: "With any amount, you can get a bowl of kokonte with your choice of sides and protein.",
      images: [
        "images/products/pedicks-food-bay/kokonte.jpg"
      ]
    },
    {
      id: 8,
      name: "Fried Rice",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/friedrice.jpg",
      description: "With any amount, you can get a plate of fried rice with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/friedrice.jpg"
      ]
    },
    {
      id: 9,
      name: "Jollof Rice",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/jollof.jpg",
      description: "With any amount, you can get a plate of jollof rice with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/jollof.jpg"
      ]
    },
    {
      id: 10,
      name: "Meat Pie",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/pie.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/pie.jpg"
      ]
    },
    
    {
      id: 11,
      name: "Banku and Okro Stew",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/banku.jpg",
      description: "With any amount, you can get a plate of banku and okro stew with your choice of sides and protein.",
      images: [
        "images/products/still-flavour-world-catering-service/banku.jpg"
      ]
    },
    {
      id: 12,
      name: "Atwemo",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/atwemo.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/atwemo.jpg"
      ]
    },
    {
      id: 13,
      name: "Rough Buns",
      price: 10,
      image: "images/products/still-flavour-world-catering-service/rough-buns.jpg",
      description: "",
      images: [
        "images/products/still-flavour-world-catering-service/rough-buns.jpg"
      ]
    },
    ],

  feedback: []
},






{
  id: "home-boys-fast-food",
  name: " Home Boys Fast Food (Taifa Junction)",
  category: "Food 🍔",
  thumbnail: "images/shops/home-boys-fast-food.jpg",
  deliveryTime: "30 - 60 mins",
  deliveryFee: 15,
  openingHours: { open: "08:00", close: "21:00" },

  products: [
       {
      id: 5,
      name: "Fried Rice",
      price: 25,
      image: "images/products/home-boys-fast-food/friedrice4.jpg",
      description: "With any amount, you can get a plate of Fried Rice with your choice of sides and protein.",
      images: [
        "images/products/home-boys-fast-food/friedrice4.jpg"
      ]
    },
        {
      id: 6,
      name: "Chicken1",
      price: 20,
      image: "images/products/home-boys-fast-food/chicken1.webp",
      description: "With any amount, you can get a plate of Fried Rice with your choice of sides and protein.",
      images: [
        "images/products/home-boys-fast-food/chicken1.webp"
      ]
    },
      {
      id: 1,
      name: "Fried Rice",
      price: 25,
      image: "images/products/home-boys-fast-food/fried-rice.webp",
      description: "With any amount, you can get a plate of Fried Rice with your choice of sides and protein.",
      images: [
        "images/products/home-boys-fast-food/fried-rice.webp"
      ]
    },
      {
      id: 7,
      name: "Chicken2",
      price: 20,
      image: "images/products/home-boys-fast-food/chicken2.jpg",
      description: "With any amount, you can get a plate of Fried Rice with your choice of sides and protein.",
      images: [
        "images/products/home-boys-fast-food/chicken2.jpg"
      ]
    },
      {
      id: 3,
      name: "Fried Rice",
      price: 25,
      image: "images/products/home-boys-fast-food/friedrice2.jpg",
      description: "With any amount, you can get a plate of Fried Rice with your choice of sides and protein.",
      images: [
        "images/products/home-boys-fast-food/friedrice2.jpg"
      ]
    },
      {
      id: 4,
      name: "Fried Rice",
      price: 25,
      image: "images/products/home-boys-fast-food/friedrice3.jpg",
      description: "With any amount, you can get a plate of Fried Rice with your choice of sides and protein.",
      images: [
        "images/products/home-boys-fast-food/friedrice3.jpg"
      ]
    },
    {
      id: 8,
      name: "Chicken3",
      price: 20,
      image: "images/products/home-boys-fast-food/chicken3.jpg",
      description: "With any amount, you can get a plate of Fried Rice with your choice of sides and protein.",
      images: [
        "images/products/home-boys-fast-food/chicken3.jpg"
      ]
    },     
    {
      id: 2,
      name: "Fried Rice",
      price: 25,
      image: "images/products/home-boys-fast-food/friedrice.jpg",
      description: "With any amount, you can get a plate of Fried Rice with your choice of sides and protein.",
      images: [
        "images/products/home-boys-fast-food/friedrice.jpg"
      ]
    },
    {
      id: 9,
      name: "Chicken4",
      price: 20,
      image: "images/products/home-boys-fast-food/chicken4.jpg",
      description: "With any amount, you can get a plate of Fried Rice with your choice of sides and protein.",
      images: [
        "images/products/home-boys-fast-food/chicken4.jpg"
      ]
    },
    
    ],

  feedback: []
},

]
;


