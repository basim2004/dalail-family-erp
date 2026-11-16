/**
 * DALAIL FAMILY ERP - Indian Currency to Words Formatter
 * 
 * Formats any donation amount into the exact required Indian financial standard:
 * "Rupees <Words> Only"
 * 
 * Examples:
 * ₹200   -> "Rupees Two Hundred Only"
 * ₹500   -> "Rupees Five Hundred Only"
 * ₹1,000 -> "Rupees One Thousand Only"
 * ₹2,000 -> "Rupees Two Thousand Only"
 * ₹5,000 -> "Rupees Five Thousand Only"
 */

export function amountToWords(num: number): string {
  const n = Math.floor(Math.abs(num || 0));
  if (n === 0) return 'Rupees Zero Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(val: number): string {
    let str = '';
    if (val >= 10000000) {
      str += convertChunk(Math.floor(val / 10000000)) + ' Crore ';
      val %= 10000000;
    }
    if (val >= 100000) {
      str += convertChunk(Math.floor(val / 100000)) + ' Lakh ';
      val %= 100000;
    }
    if (val >= 1000) {
      str += convertChunk(Math.floor(val / 1000)) + ' Thousand ';
      val %= 1000;
    }
    if (val >= 100) {
      str += convertChunk(Math.floor(val / 100)) + ' Hundred ';
      val %= 100;
    }
    if (val > 0) {
      if (str !== '') str += 'and ';
      if (val < 20) {
        str += units[val] + ' ';
      } else {
        str += tens[Math.floor(val / 10)] + ' ';
        if (val % 10 > 0) {
          str += units[val % 10] + ' ';
        }
      }
    }
    return str.trim();
  }

  const rawWords = convertChunk(n).replace(/\s+/g, ' ').trim();
  return `Rupees ${rawWords} Only`;
}

// Backward-compatibility aliases
export const numberToWords = amountToWords;
export const numberToWordsIndian = amountToWords;
