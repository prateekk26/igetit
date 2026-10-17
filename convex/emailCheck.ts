// One email check for the sign-in screen and the server (18 Oct: a sign-up saved as "test@demo..com"; the screen only
// asked for an @ and a dot, and the server asked nothing). No spaces, one @, no dot at either end of the name or two in a
// row, and a domain of dot-separated labels ending in letters.
export const EMAIL_OK = /^(?!\.)(?!.*\.\.)[^\s@]+(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
export const isEmail = (s: string) => EMAIL_OK.test(s.trim());
