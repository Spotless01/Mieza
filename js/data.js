const shops = [
  {
    id: "gracious-classic",
    name: "Gracious Classic Fabric Hub",
    category: "Fashion 🧵",
    thumbnail: "images/shops/gracious_classic.jpg",
    deliveryTime: "less than 30 mins",
    deliveryFee: 20,
    openingHours: { open: "08:00", close: "21:59" },
    products: [
      {
        id: 36,
        name: "Avetos Ethic Sandals",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe11.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe11.jpg"
        ]
      },
      {
        id: 30,
        name: "Avetos Loafer Shoe for men",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe1.jpg",
        description: "Size 41 -45",
        images: [
          "images/products/gracious_classic_fabric/shoe1.jpg"
        ]
      },
      {
        id: 1,
        name: "Esterica Print",
        price: 450,
        image: "images/products/gracious_classic_fabric/cloth1.png",
        description: "6 yards",
        images: [
          "images/products/gracious_classic_fabric/cloth1.png"
        ]
      },
      {
        id: 2,
        name: "Esterica Print",
        price: 450,
        image: "images/products/gracious_classic_fabric/cloth2.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth2.png"
        ]
      },
      {
        id: 31,
        name: "Mantaray hiking boots",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe2.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe2.jpg"
        ]
      },
      {
        id: 3,
        name: "Esterica Print",
        price: 450,
        image: "images/products/gracious_classic_fabric/cloth3.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth3.png"
        ]
      },
      {
        id: 37,
        name: "Double Monk Strap",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe10.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe10.jpg"
        ]
      },
      {
        id: 4,
        name: "Esterica Print",
        price: 450,
        image: "images/products/gracious_classic_fabric/cloth4.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth4.png"
        ]
      },
      {
        id: 32,
        name: "Mantaray Tay leather boot",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe3.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe3.jpg"
        ]
      },
      {
        id: 5,
        name: "Esterica Print",
        price: 450,
        image: "images/products/gracious_classic_fabric/cloth5.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth5.png"
        ]
      },
      {
        id: 6,
        name: "Esterica Print",
        price: 450,
        image: "images/products/gracious_classic_fabric/cloth6.png",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth6.png"
        ]
      },
      {
        id: 38,
        name: "Casual Sneaker",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe9.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe9.jpg"
        ]
      },
      {
        id: 7,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth7.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth7.jpg"
        ]
      },
      {
        id: 8,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth8.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth8.jpg"
        ]
      },
      {
        id: 43,
        name: "Alko Plus APS Shoe",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe13.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe13.jpg"
        ]
      },
      {
        id: 9,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth9.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth9.jpg"
        ]
      },

      {
        id: 10,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth10.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth10.jpg"
        ]
      },
      {
        id: 39,
        name: "Avetos Ethic Sandals",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe8.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe8.jpg"
        ]
      },
      {
        id: 11,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth11.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth11.jpg"
        ]
      },
      {
        id: 12,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth12.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth12.jpg"
        ]
      },
      {
        id: 13,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth13.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth13.jpg"
        ]
      },
      {
        id: 14,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth14.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth14.jpg"
        ]
      },
      {
        id: 15,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth15.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth15.jpg"
        ]
      },
      {
        id: 40,
        name: "Black Shoe",
        price: 450,
        image: "images/products/gracious_classic_fabric/shoe7.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe7.jpg"
        ]
      },
      {
        id: 16,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth16.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth16.jpg"
        ]
      },
      {
        id: 18,
        name: "Esterica Print",
        price: 250,
        image: "images/products/gracious_classic_fabric/cloth18.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth18.jpg"
        ]
      },
      {
        id: 19,
        name: "Esterica Print",
        price: 250,
        image: "images/products/gracious_classic_fabric/cloth19.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth19.jpg"
        ]
      },
      {
        id: 35,
        name: "Black Chunky Loafer",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe12.jpg",
        description: "Size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe12.jpg"
        ]
      },
      {
        id: 20,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth20.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth20.jpg"
        ]
      },
      {
        id: 41,
        name: "Black Shoe",
        price: 450,
        image: "images/products/gracious_classic_fabric/shoe7.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe7.jpg"
        ]
      },
      {
        id: 21,
        name: "Esterica Print",
        price: 250,
        image: "images/products/gracious_classic_fabric/cloth21.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth21.jpg"
        ]
      },
      {
        id: 22,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth22.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth22.jpg"
        ]
      },
      {
        id: 23,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth23.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth23.jpg"
        ]
      },
      {
        id: 24,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth24.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth24.jpg"
        ]
      },
      {
        id: 42,
        name: "Mens's Derby Brogue",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe6.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe6.jpg"
        ]
      },
      {
        id: 25,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth25.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth25.jpg"
        ]
      },
      {
        id: 26,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth26.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth26.jpg"
        ]
      },
      {
        id: 27,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth27.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth27.jpg"
        ]
      },
      {
        id: 28,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth28.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth28.jpg"
        ]
      },
      {
        id: 29,
        name: "Esterica Print",
        price: 300,
        image: "images/products/gracious_classic_fabric/cloth29.jpg",
        description: "",
        images: [
          "images/products/gracious_classic_fabric/cloth29.jpg"
        ]
      },
      {
        id: 33,
        name: "Thomas Crick Clayton loafers",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe4.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe4.jpg"
        ]
      },
      {
        id: 34,
        name: "Mantaray Tay leather boot",
        price: 500,
        image: "images/products/gracious_classic_fabric/shoe5.jpg",
        description: "size 41 - 45",
        images: [
          "images/products/gracious_classic_fabric/shoe5.jpg"
        ]
      },
    ],

    feedback: []
  }
];
