/** Convert rupees (float) to integer paise. Use at input boundaries only. */
export const rupeesToPaise = (rupees: number): number =>
  Math.round(rupees * 100);

/** Convert integer paise to rupee string with Indian digit grouping */
export const paiseToRupees = (paise: number): string => {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(rupees);
};

/** Convert integer paise to plain number (for calculations) */
export const paiseToFloat = (paise: number): number => paise / 100;

/** Amount in words (Indian system: lakh, crore) */
export const amountInWords = (paise: number): string => {
  const rupees = Math.floor(paise / 100);
  const p = paise % 100;
  return `${numberToWords(rupees)} rupees${p > 0 ? ` and ${p} paise` : ''} only`;
};

const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function numberToWords(n: number): string {
  if (n === 0) return 'zero';
  if (n < 0) return `minus ${numberToWords(-n)}`;
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : '');
  if (n < 1000) return `${ones[Math.floor(n / 100)]} hundred${n % 100 ? ` ${numberToWords(n % 100)}` : ''}`;
  if (n < 100000) return `${numberToWords(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${numberToWords(n % 1000)}` : ''}`;
  if (n < 10000000) return `${numberToWords(Math.floor(n / 100000))} lakh${n % 100000 ? ` ${numberToWords(n % 100000)}` : ''}`;
  return `${numberToWords(Math.floor(n / 10000000))} crore${n % 10000000 ? ` ${numberToWords(n % 10000000)}` : ''}`;
}
