import type { Route } from 'next';

export function postHref(
  fieldSlug: string,
  categorySlug: string,
  postSlug: string
): Route {
  return `/fields/${fieldSlug}/${categorySlug}/${postSlug}` as Route;
}

export function categoryHref(fieldSlug: string, categorySlug: string): Route {
  return `/fields/${fieldSlug}/${categorySlug}` as Route;
}

export function fieldHref(fieldSlug: string): Route {
  return `/fields/${fieldSlug}` as Route;
}

export function bookHref(slug: string): Route {
  return `/books/${slug}` as Route;
}

export function tagHref(slug: string): Route {
  return `/tags/${slug}` as Route;
}
