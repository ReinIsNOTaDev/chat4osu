import { animate, query, style, transition, trigger } from '@angular/animations';

export const fadeInAnimation =
  trigger('routeAnimations', [
    transition('ChatPage <=> SettingsPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ]),
      query(':enter', [
        style({
          opacity: 0
        })
      ]),
      query(':enter', [
        animate('100ms ease-out', style({
          opacity: 1
        }))
      ])
    ])
  ]);
