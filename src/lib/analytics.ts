export const trackOutboundLink = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'click_to_site', {
      'event_category': 'outbound',
      'event_label': url,
      'transport_type': 'beacon'
    });
  }
};

export const trackSearch = (query: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'search', {
      'search_term': query
    });
  }
};

export const trackAddToFavorite = (itemId: string, itemTitle: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'add_to_favorite', {
      'item_id': itemId,
      'item_name': itemTitle
    });
  }
};
