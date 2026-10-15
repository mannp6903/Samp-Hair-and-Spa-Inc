# Samp Hair & Spa website

A cozy, image-led, mobile-first one-page site for **Samp Hair & Spa**, a hair salon and spa at
314 Painted Post Dr, Scarborough, ON.

It is plain HTML, CSS and a little JavaScript. There is no build step and no framework, so it loads fast and
can be hosted anywhere (GitHub Pages, Netlify, Cloudflare Pages, or any web host). Just upload these files.

```
index.html    page content (all sections)
styles.css    look and layout (colours and fonts are set at the top)
script.js     booking link, booking form, "open now" status
assets/       logo.svg (full logo), logo-mark.svg (swirl only, used as favicon), apple-touch-icon.png
robots.txt, sitemap.xml
```

To preview it on your computer, open `index.html` in a browser, or run `python3 -m http.server` in this
folder and visit http://localhost:8000.

## Page sections

Hero (with open-now status and address) → Welcome → Services & prices → Gallery → Team → Reviews →
Gift cards → Book online → Visit (hours and map) → Footer.

Phone visitors always see a sticky **Call · Directions · Book now** bar at the bottom of the screen. On
desktop, a floating **Book now** button appears once you scroll past the hero.

## Things to finish before going live

1. **Online booking (most important).** Open `script.js` and paste your Fresha, Square, Vagaro or similar
   booking page into `BOOKING_URL`:
   ```js
   const BOOKING_URL = 'https://www.fresha.com/your-salon';
   ```
   Every "Book" button will then open it. Until you do, the built-in form sends a booking request by email
   to samphairandspa@gmail.com.
2. **Real photos.** The hero and gallery use placeholder stock photos from Unsplash. Replace them with your
   own photos of your work and your space: put the files in `assets/` and change the `src`/`srcset` in
   `index.html`. Save photos as JPG or WebP, about 1600px wide for the hero and 800px for the gallery.
3. **Team.** The Team section lists roles only. Add each person's name, photo and a one-line bio.
4. **Prices.** Many services say "Call for price". Adding starting prices builds trust.
5. **Gift cards.** Remove the gift card section from `index.html` if you don't sell them.
6. **Instagram.** If you have an Instagram account, add it next to Facebook in the gallery header and footer.
7. **Domain.** If you move to your own domain, update the URLs in `index.html` (canonical, Open Graph and
   JSON-LD), `robots.txt` and `sitemap.xml`.

## Design

Cozy and warm, built around the salon's own magenta logo (traced vector, `assets/logo.svg`).

- Palette: oat `#f6ede2`, linen `#fdf8f2`, sand `#efe2d2`, cocoa text `#3d2a26`, berry `#8e2f6b` for buttons
  (a deeper shade of the logo magenta `#e053b7`, so white text stays readable), blush `#f6dbe3`, plum `#3f2433`
- Fonts: Fraunces for headings, Nunito for text (Google Fonts)
- Soft touches: arched photo frames, rounded cards with gentle shadows, a wavy reviews band, a gift card mock-up
- No heavy animation; smooth scrolling is turned off for visitors who ask for reduced motion
- Local SEO: the title, description and headings say "hair salon in Scarborough", and the page includes
  `HairSalon` structured data with your address, phone, hours and logo
