/* eslint-disable arrow-body-style */
import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { take, delay, tap, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

export interface BookingData {
  placeId: string;
  userId: string;
  placeTitle: string;
  placeImage: string;
  firstName: string;
  lastName: string;
  guestNumber: number;
  bookedFrom: string;
  bookedTo: string;
}
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

  get bookings() {
    return this._bookings.asObservable();
  }

  addBooking(booking: Booking) {
    let generatedId;
    return this.http
      .post<{ name: string }>(
        'https://place-booking-1a473-default-rtdb.firebaseio.com/bookings.json',
        { ...booking, id: null }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.bookings;
        }),
        take(1),
        tap((bookings) => {
          booking.id = generatedId;
          this._bookings.next(bookings.concat(booking));
        })
      );
  }

  cancelBooking(bookingId) {
    return this.http
      .delete(
        `https://place-booking-1a473-default-rtdb.firebaseio.com/bookings/${bookingId}.json"`
      )
      .pipe(
        switchMap(() => {
          return this.bookings;
        }),
        take(1),
        tap((bookings) => {
          this._bookings.next(bookings.filter((b) => b.id !== bookingId));
        })
      );
  }

  fetchBookings() {
    return this.http
      .get<{ [key: string]: BookingData }>(
        `https://place-booking-1a473-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${this.authService.userId}"`
      )
      .pipe(
        map((resData) => {
          const bookings = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              bookings.push(
                new Booking(
                  key,
                  resData[key].placeId,
                  resData[key].userId,
                  resData[key].placeTitle,
                  resData[key].placeImage,
                  resData[key].firstName,
                  resData[key].lastName,
                  resData[key].guestNumber,
                  new Date(resData[key].bookedFrom),
                  new Date(resData[key].bookedTo)
                )
              );
            }
          }
          return bookings;
        }),
        tap((bookings) => {
          this._bookings.next(bookings);
        })
      );
  }
}
