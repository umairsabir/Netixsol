const billInput = document.getElementById('bill');
const peopleInput = document.getElementById('people');
const customTipInput = document.getElementById('custom-tip');
const tipButtons = document.querySelectorAll('.tip-btn');
const tipAmountDisplay = document.getElementById('tip-amount');
const totalDisplay = document.getElementById('total');
const resetButton = document.getElementById('reset');
const peopleError = document.getElementById('people-error');

let billValue = 0;
let peopleValue = 0;
let tipPerc = 0;

function calculate() {
  if (peopleValue >= 1) {
    let tipAmount = (billValue * (tipPerc / 100)) / peopleValue;
    let total = (billValue / peopleValue) + tipAmount;
    
    tipAmountDisplay.innerText = `$${tipAmount.toFixed(2)}`;
    totalDisplay.innerText = `$${total.toFixed(2)}`;
  } else {
    tipAmountDisplay.innerText = `$0.00`;
    totalDisplay.innerText = `$0.00`;
  }
}

function handleResetButtonState() {
  if (billInput.value === '' && peopleInput.value === '' && customTipInput.value === '' && tipPerc === 0) {
    resetButton.disabled = true;
    resetButton.classList.add('opacity-20');
  } else {
    resetButton.disabled = false;
    resetButton.classList.remove('opacity-20');
  }
}

function resetActiveButtons() {
  tipButtons.forEach(btn => {
    btn.classList.remove('bg-strong-cyan', 'text-very-dark-cyan');
    btn.classList.add('bg-very-dark-cyan', 'text-white');
  });
}

function setActiveButton(btn) {
  resetActiveButtons();
  btn.classList.remove('bg-very-dark-cyan', 'text-white');
  btn.classList.add('bg-strong-cyan', 'text-very-dark-cyan');
}

function checkPeopleInput() {
  if (peopleInput.value === '0') {
    peopleError.classList.remove('hidden');
    peopleInput.classList.remove('focus:ring-strong-cyan', 'hover:ring-strong-cyan', 'focus:outline-none');
    peopleInput.classList.add('focus:ring-error', 'hover:ring-error', 'ring-2', 'ring-error', 'outline-none');
  } else {
    peopleError.classList.add('hidden');
    peopleInput.classList.add('focus:ring-strong-cyan', 'hover:ring-strong-cyan', 'focus:outline-none');
    peopleInput.classList.remove('focus:ring-error', 'hover:ring-error', 'ring-2', 'ring-error', 'outline-none');
  }
}

billInput.addEventListener('input', (e) => {
  if (e.target.value === '') {
    billValue = 0;
  } else {
    billValue = parseFloat(e.target.value);
  }
  handleResetButtonState();
  calculate();
});

peopleInput.addEventListener('input', (e) => {
  checkPeopleInput();
  if (e.target.value === '' || parseFloat(e.target.value) === 0) {
    peopleValue = 0;
  } else {
    peopleValue = parseFloat(e.target.value);
  }
  handleResetButtonState();
  calculate();
});

tipButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    customTipInput.value = '';
    tipPerc = parseFloat(e.target.dataset.val);
    setActiveButton(e.target);
    if (peopleInput.value === '') {
        // Option to warn if people is empty, but strict requirements say only 0 is an error.
    }
    handleResetButtonState();
    calculate();
  });
});

customTipInput.addEventListener('input', (e) => {
  resetActiveButtons();
  if (e.target.value === '') {
    tipPerc = 0;
  } else {
    tipPerc = parseFloat(e.target.value);
  }
  handleResetButtonState();
  calculate();
});

resetButton.addEventListener('click', () => {
  billInput.value = '';
  billValue = 0;
  peopleInput.value = '';
  peopleValue = 0;
  customTipInput.value = '';
  tipPerc = 0;
  resetActiveButtons();
  checkPeopleInput();
  
  tipAmountDisplay.innerText = `$0.00`;
  totalDisplay.innerText = `$0.00`;
  handleResetButtonState();
});

// Initial Setup
handleResetButtonState();
