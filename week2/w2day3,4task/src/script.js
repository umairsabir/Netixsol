fetch('restaurant.json')
  .then(res => res.json())
  .then(data => {
    rendersimilarrestaurant(data);
    renderreview(data);
    data.menu.forEach(sectionObj => {
      const section = sectionObj.section;

      if (section.title === "Burgers") {
        renderItems(section.items, "burger-container");
      }
      if (section.title === "Fries") {
        renderItems(section.items, "fries-container");
      }
      if (section.title === "Cold Drinks") {
        renderItems(section.items, "drinks-container");
      }

    });
  })
  .catch(err => console.log("Error:", err));

//render Card function
function renderItems(items, containerId) {

  const container = document.getElementById(containerId);

  container.innerHTML = items.map(item => {
    return `
      <div class="bg-white rounded-xl shadow p-4 flex sm:flex-row flex-col justify-between items-center gap-2">

        <div class="flex-1 font-Poppins">
          <h3 class="font-bold text-[16px]">${item.name}</h3>
          <p class="text-xs text-gray-500 mt-3">
            ${item.description}
          </p>
          <p class="font-bold text-sm mt-2">£${item.price}</p>
        </div>

        <div class="relative">
          <img src="${item.image}" class="w-40 h-45 object-cover rounded-lg">

          <div class="absolute -bottom-2 -right-2 bg-white w-20 h-20 rounded-tl-4xl flex justify-center items-center">
            <button onclick='addToCart(${JSON.stringify(item)})' class="bg-black text-white w-10 h-10 cursor-pointer rounded-full">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>

        </div>

      </div>
    `;
  }).join("");

}

let cart = [];
function addToCart(item) {

  const existingItem = cart.find(i => i.name === item.name);


  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  }

  updateCartUI();

  showToast(`${item.name} added to cart.`);
}
function updateCartUI() {
  const cartContainer = document.getElementById("cartdata");
  const totalElement = document.getElementById("cart-total");
  const counter = document.getElementById("cardcounter");

  cartContainer.innerHTML = "";

  let total = 0;
  let totalItems = 0; // 👈 counter ke liye

  cart.forEach((item , index) => {
    total += item.price * item.quantity;
    totalItems += item.quantity; // 👈 quantity count

    cartContainer.innerHTML += `
      <div class="flex justify-between items-center bg-[#000000]/15 w-full relative rounded-xl mt-2">
                    <img class="sm:w-18 w-12  sm:h-18 h-12 rounded-full sm:p-3 p-1" src="${item.image}"
                        alt="">
                    <div class="sm:block hidden absolute left-1/6 top-3 bottom-3 w-[1px] bg-[#000000]/40"></div>
                    <h1 class="font-bold sm:text-[10px] text-[8px]  sm:pr-20">${item.name}</h1>
                    <div class="flex sm:pr-3 pr-1 sm:gap-2 gap-1">
                        <button onclick="decrementItem(${index})">
                            <i class="fa-solid fa-circle-minus cursor-pointer sm:text-[16px] text-[10px]"></i>
                        </button>
                        <div class="bg-white sm:p-2 p-1 sm:px-3 font-bold rounded-xs sm:text-[14px] text-[10px]">
                            ${item.quantity}
                        </div>
                        <button onclick="incrementItem(${index})">
                            <i class="fa-solid fa-circle-plus cursor-pointer sm:text-[16px] text-[10px]"></i>
                        </button>
                    </div>
                </div>
    `;
  });

  totalElement.innerText = `£${total.toFixed(2)}`;

  // 🔥 COUNTER LOGIC
  if (totalItems > 0) {
    counter.classList.remove("hidden"); // show
    counter.innerText = totalItems;     // number update
  } else {
    counter.classList.add("hidden");    // hide
  }

  
}
function incrementItem(index) {
  cart[index].quantity += 1;
  updateCartUI();
}
function decrementItem(index) {
  cart[index].quantity -= 1;

  // remove if 0
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  updateCartUI();
}
//render similar restaurant function
function rendersimilarrestaurant(item) {
  const resContainer = document.getElementById("res-container");

  item.similarRestaurants.forEach(item => {
    resContainer.innerHTML += `
      <div class="bg-white rounded-xl shadow overflow-hidden text-center">
                <div class="h-40">
                    <img src="${item.image}" class="h-40 size-50">
                </div>
                <p class="text-sm font-medium py-2">${item.name}</p>
            </div>
      `;
  });
}
//render review card function
function renderreview(item) {
  const resContainer = document.getElementById("review-slider");

  item.reviews.forEach(item => {
    resContainer.innerHTML += `
       <div class="bg-white font-Poppins p-6 rounded-xl md:min-w-[33%] min-w-full">
                <div class="flex justify-between mb-3 relative"> <img src="${item.image}"
                        class="w-10 h-10 rounded-full">
                    <div class="hidden lg:block absolute lg:left-1/6 top-1 bottom-1 w-[2px] bg-[#FC8A06]"></div>
                    <div class="sm:pr-8 lg:pl-3  pl-2 ">
                        <h4 class="font-semibold text-sm">${item.name}</h4>
                        <p class="text-xs text-[#FC8A06]">${item.location}</p>
                    </div>
                    <div class="text-orange-400 text-sm text-right"> 
                    ${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)}
                    <p class="text-black">
                    <i class="fa-regular fa-alarm-clock text-[#FC8A06]"></i>${item.date}</p>
                    </div>
                </div>
                <p class="text-xs text-black"> The positive aspect was undoubtedly the efficiency of the service. The
                    queue moved quickly, the staff was friendly, and the food was up to the usual McDonald's standard –
                    hot and satisfying. </p>
            </div>
      `;
  });
}
// REVIEW SLIDER
let scrollAmount = 0;
const slider = document.getElementById("review-slider");
const nextBtn = document.getElementById("nexbtn");
const prevBtn = document.getElementById("pervbtn");
nextBtn.addEventListener("click", () => {
  const maxScroll = slider.scrollWidth - slider.parentElement.clientWidth;
  scrollAmount += 400; // card width
  if (scrollAmount > maxScroll) scrollAmount = maxScroll;
  slider.style.transform = `translateX(-${scrollAmount}px)`;
});
prevBtn.addEventListener("click", () => {
  scrollAmount -= 400;
  if (scrollAmount < 0) {
    scrollAmount = 0;
  }

  slider.style.transform = `translateX(-${scrollAmount}px)`;
});
// popup card function
const cartBtn = document.getElementById("cart-btn");
const overlay = document.getElementById("cart-overlay");
const closeCart = document.getElementById("close-cart");
// Open popup
cartBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
  overlay.classList.add("flex");
});
// Close popup
closeCart.addEventListener("click", () => {
  overlay.classList.add("hidden");
  overlay.classList.remove("flex");
});

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.classList.remove("opacity-0");
  toast.classList.add("opacity-100");

  setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0");
  }, 2000); // 2 sec show
}