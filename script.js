import { js, jsonData } from "./data.js";

console.log(`js`, js);
console.log(`jsonData`, jsonData);

const bigImage = document.getElementById("big-img");
const smallImagesRow = document.getElementsByClassName("small-img-row")[0];

const title = document.getElementById("title");
const description = document.getElementById("description");
const price = document.getElementById("price");
const comparedPrice = document.getElementById("compared-price");
const addToCartBtn = document.querySelector("a.btn");
const variantsDiv = document.querySelector("#variants");

// load static data
loadStaticData();

// sortedImagesObj to show iamges variant wise
const sortedImageObj = createImageObj(jsonData);
console.log(`sortedImageObj`, sortedImageObj);

// declare selectedOptions array to store the values of
// selected options by a user
// dynamically define SelectedOptions
const selectedOptions = {};
js.options?.forEach((option) => {
  selectedOptions[option.name] = option.values[0];
});
console.log(selectedOptions);

loadDynamicContent();
function loadDynamicContent() {
  // load small images from our sortedImageObj ,load price , compared price,
  // also changes big image according to small images
  loadSmallImages(getVariantID().variantIDforimg);
  loadPrices(getVariantID().variantID);
  function loadBigImage() {
    const firstSmallImage = document.querySelector(".small-img-col img");
    bigImage.src = firstSmallImage.src;
  }
  loadBigImage();
}

// load options from js
loadOptionsDom();
// aslo loads variant option buttons

// 1. make sold out visible on add to cart
// # check if selected combination is available -
// # then display the output on addtoCart btn
onClickBtnChangeFunctionality();
function onClickBtnChangeFunctionality() {
  variantBtnColorChange();
  addToCartBtnChange(...checkForCombination());
}

// 2. assist user in selecting options
// - create possibility array

// change color row variant buttons on every Alt+p keypress

document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key == "p") changeColorVariantBtnStyle();
});

const changeColorVariantBtnStyle = xyz();
function xyz() {
  let i = 0;
  function inner() {
    // console.log(i);
    if (i == 0) changeToDropDown();
    else if (i == 1) changeToColorSwatch();
    else if (i == 2) changeToImageSwatch();
    else if (i == 3) changeToBtn();
    i > 2 ? (i = 0) : i++;
  }
  return inner;
}

//#endregion

// declare functions

// function to load static data - load title , description , and  initial big image
function loadStaticData() {
  title.innerHTML = js.title;
  description.innerHTML = js.description;
  bigImage.src = js.featured_image;
}
// function to create Image Obj
function createImageObj(jsonData) {
  const sortedImageObj = {};
  let lastID = 0;
  function innerFunction() {
    jsonData.product.images.forEach((image) => {
      if (image.variant_ids[0]) {
        sortedImageObj[`${image.variant_ids}`] = [];
        sortedImageObj[`${image.variant_ids}`].push(image.src);
        lastID = image.variant_ids;
      } else {
        (
          sortedImageObj[`${lastID}`] ||
          (sortedImageObj[(lastID = "global-images")] = [])
        ).push(image.src);
      }
    });
    // to push global images to every variant
    for (let key in sortedImageObj) {
      if (key != "global-images") {
        if (sortedImageObj["global-images"]) {
          sortedImageObj[key].push(...sortedImageObj["global-images"]);
        }
      }
    }
    // to delete the global images since we dont need them
    delete sortedImageObj["global-images"];
  }
  innerFunction();
  return sortedImageObj;
}

// load small images
function loadSmallImages(variantID) {
  smallImagesRow.innerHTML = "";
  sortedImageObj[`${variantID}`].forEach((imageUrl, index) => {
    smallImagesRow.appendChild(createSmallImage(imageUrl));
  });
}

// create a small image
function createSmallImage(imageUrl) {
  const imgCol = document.createElement("div");
  imgCol.className = "small-img-col";

  const img = document.createElement("img");
  img.src = imageUrl;
  img.style.width = `100%`;

  img.addEventListener("click", (e) => {
    onSmallImageClick(e);
  });
  imgCol.appendChild(img);
  return imgCol;
}

// on small Image Click
function onSmallImageClick(e) {
  bigImage.src = e.target.src;
}

// load prices by variant ID using js
function loadPrices(variantID) {
  let NO_VARIANT_FOUND = true;
  js.variants.forEach((variant) => {
    if (variant.id == variantID) {
      displayPrice(variant.price, variant.compare_at_price);
      NO_VARIANT_FOUND = false;
    }
  });
  if (NO_VARIANT_FOUND) {
    displayPrice("null", "null");
  }
}

function displayPrice(givenPrice, givenComparePrice) {
  if (givenPrice && givenComparePrice == "null") {
    price.innerText = "";
    comparedPrice.innerText = "";
  } else {
    price.innerText = String(givenPrice).slice(0, -2) + " INR";
    comparedPrice.innerText = String(givenComparePrice).slice(0, -2) + " INR";
  }
}

// load options in dom from js
function loadOptionsDom() {
  js.options.forEach((optionRowData) => {
    const labelAndRow = createOptionsRow(optionRowData);
    labelAndRow.forEach((e) => {
      variantsDiv.appendChild(e);
    });
  });
}

function createOptionsRow(optionRowData) {
  const label = document.createElement("label");
  label.innerText = optionRowData.name;
  const row = document.createElement("div");
  row.className = "row";
  row.id = `${optionRowData.name}`;
  row.position = `${optionRowData.position}`;
  optionRowData.values.forEach((value) => {
    row.appendChild(createVariantButton(value));
  });
  return [label, row];
}

// for creating swatch -
// #check if js.options.option.name = color
// # if color then for each value of values create a btn with image src = (
//  loop through js.variants to find the featured image of option1 = blue
//)

function createVariantButton(value) {
  // what to do when
  const btn = createBtn(value);
  // function for creating a variant btn

  return btn;
}

function onVariantBtnClick(e) {
  selectedOptions[e.target.parentElement.id] = e.target.value;

  //changes btn attributes - (btn background color to black)
  onClickBtnChangeFunctionality();
  // change dynmaic content (images and prices)
  loadDynamicContent();
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// checkForCombination from js
function checkForCombination() {
  let combinationAvailable = false;
  let combinationMade = false;
  // write code to check if the combination is available and whether it is sold by the store.
  const arr = [];
  for (const [index, [key, value]] of Object.entries(
    Object.entries(selectedOptions)
  )) {
    arr[index] = value;
  }
  js.variants?.forEach((variant) => {
    if (arraysEqual(arr, variant.options)) {
      combinationMade = true;
      combinationAvailable = variant.available;
    }
  });
  return [combinationMade, combinationAvailable];
}
function addToCartBtnChange(combinationMade, combinationAvailable) {
  addToCartBtn.style.backgroundColor =
    combinationMade && combinationAvailable ? "#ff523b" : "#808080";
  addToCartBtn.innerText = combinationMade
    ? combinationAvailable
      ? "Add To Card"
      : "Sold Out"
    : "Combination Unavailable";
}
// variant btn color change on click functionality
function variantBtnColorChange() {
  // for buttons
  const btns = document.querySelectorAll("btn.btn");
  Array.from(btns).forEach((btn) => {
    for (const [index, [key, value]] of Object.entries(
      Object.entries(selectedOptions)
    )) {
      if (value == btn.value) {
        btn.style.backgroundColor = "black";
        break;
      } else btn.style.backgroundColor = "#ff523b";
    }
  });
  // for dropdowns
  const dropdown = document.getElementsByTagName("select")[0];
  if (dropdown) {
    // console.log(dropdown);
    dropdown.value = selectedOptions["Color"];
  }
  // for color swatches
  const colorSwatchBtns = document.querySelectorAll("btn.btn-color-swatch");
  Array.from(colorSwatchBtns).forEach((btn) => {
    for (const [index, [key, value]] of Object.entries(
      Object.entries(selectedOptions)
    )) {
      if (selectedOptions[key] == btn.value) {
        btn.style.setProperty("--shadow", "0px 0px 0px 2px #ff523b");
        break;
      } else btn.style.setProperty("--shadow", "");
    }
  });

  // for image swatches
  const imageSwatchBtns = document.querySelectorAll("input.picker-img");
  Array.from(imageSwatchBtns).forEach((btn) => {
    for (const [index, [key, value]] of Object.entries(
      Object.entries(selectedOptions)
    )) {
      if (selectedOptions[key] == btn.value) {
        btn.style.backgroundColor = "black";
        break;
      } else btn.style.backgroundColor = "";
    }
  });
}

// used in loading images and prices
function getVariantID() {
  let variantIDforimg = 0,
    variantID = 0;

  js.variants.forEach((variant) => {
    if (variant.option1 == selectedOptions["Color"] && variant.featured_image) {
      variantIDforimg = variant.featured_image.variant_ids[0];
    }
    const arr = [];
    for (const [index, [key, value]] of Object.entries(
      Object.entries(selectedOptions)
    )) {
      arr[index] = value;
    }
    if (arraysEqual(variant.options, arr)) {
      variantID = variant.id;
    }
  });
  return { variantIDforimg, variantID };
}

// function for creating a color variant image-swatch btn

// function for creating a color variant dropdown btn
function changeToDropDown() {
  // console.log(`changed to dropdown`);

  const row1 = document.getElementById("Color");
  row1.innerHTML = "";
  row1.style.display = "block";
  createDropdown(row1);
  variantBtnColorChange();
}
function createDropdown(row1) {
  row1.innerHTML += `<select style="margin: 5px 0px 5px 45px"></select>`;
  const select = document.getElementsByTagName("select")[0];
  for (let i = 0; i < js.options.length; i++) {
    if (js.options[i].position == 1) {
      for (let j = 0; j < js.options[i].values.length; j++) {
        select.innerHTML += `<option value="${js.options[i].values[j]}">${js.options[i].values[j]}</option>`;
      }
    }
  }
  select.addEventListener("change", (e) => {
    onVariantBtnClick(e);
  });
  // console.log(`row1`, row1);
}

function changeToBtn() {
  // console.log(`changed to btn`);

  const row1 = document.getElementById("Color");
  row1.style.display = "flex";
  row1.innerHTML = "";
  const values = [];
  js.options.forEach((option) => {
    option.position == 1 ? values.push(...option.values) : null;
  });
  values.forEach((value) => {
    const btn = createBtn(value);
    row1.appendChild(btn);
  });
  variantBtnColorChange();
}

// function for creating a color variant btn
function createBtn(value) {
  const btn = document.createElement("btn");
  btn.className = "btn";
  btn.style.margin = "10px";
  btn.value = value;
  btn.style.padding = "4px 30px";
  btn.innerText = value;
  btn.addEventListener("click", (e) => {
    onVariantBtnClick(e);
  });
  return btn;
}

// function for creating a color variant color-swatch btn
function changeToColorSwatch() {
  // console.log(`chages to color swatch`);
  const row1 = document.getElementById("Color");
  row1.style.display = "flex";
  row1.innerHTML = "";
  const values = [];
  js.options.forEach((option) => {
    option.position == 1 ? values.push(...option.values) : null;
  });
  values.forEach((value) => {
    const btn = createColorSwatchBtn(value);
    row1.appendChild(btn);
  });
  variantBtnColorChange();
}
// create color swatch btn
function createColorSwatchBtn(value) {
  const btn = createBtn(value);
  btn.className = "btn-color-swatch";
  btn.innerText = "-----";
  btn.style.setProperty("--background-color", `${value}`);
  btn.style.setProperty("--background-on-hover", `${value}`);
  btn.style.setProperty("--color", `${value}`);

  return btn;
}

function changeToImageSwatch() {
  // console.log(`changed to image swatch`);
  const row1 = document.getElementById("Color");
  row1.innerHTML = "";
  row1.style.display = "flex";
  const values = [];
  js.options.forEach((option) => {
    option.position == 1 ? values.push(...option.values) : null;
  });
  createImageSwatch(values, row1);
  variantBtnColorChange();
}

function createImageSwatch(values, row1) {
  let ArrImageSrc = [];
  jsonData.product.variants.forEach((variant, index) => {
    jsonData.product.images.forEach((image) => {
      if (image.id == variant.image_id) {
        ArrImageSrc.push(image.src);
      }
    });
  });
  ArrImageSrc.forEach((imgSrc, index) => {
    const imageEl = document.createElement("input");
    imageEl.type = "image";
    imageEl.className = "picker-img";
    imageEl.value = values[index];
    imageEl.src = imgSrc;
    imageEl.style.border = "0px solid #ff523b";
    imageEl.addEventListener("click", (e) => {
      onVariantBtnClick(e);
    });
    row1.appendChild(imageEl);
  });
}

// additional functinality to keep the number of pieces to buy at a time from 1 to 4
buyingLimit(4);
function buyingLimit(limit) {
  const amountInput = document.getElementById("amount-input");
  amountInput.setAttribute("max", `${limit}`);
  amountInput.addEventListener("keydown", (e) => {
    const regex = new RegExp(/[0-9]/);
    if (regex.test(e.key)) {
      e.target.value = e.key;
      setTimeout(() => {
        e.target.value > limit
          ? e.key > limit
            ? (e.target.value = limit)
            : (e.target.value = e.key)
          : null;
        e.target.value < 1 ? (e.target.value = 1) : null;
      }, 0);
    }
  });
}
