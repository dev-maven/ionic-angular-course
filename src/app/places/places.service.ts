/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take, map, delay, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';

interface PlaceData {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  availableFrom: string;
  availableTo: string;
  userId: string;
  location: PlaceLocation;
}
@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);
  get places() {
    // eslint-disable-next-line no-underscore-dangle
    return this._places.asObservable();
  }
  constructor(private authService: AuthService, private http: HttpClient) {}

  getPlace(id: string) {
    return this.http
      .get(
        `https://place-booking-1a473-default-rtdb.firebaseio.com/offered-places/${id}.json`
      )
      .pipe(
        map((placeData: PlaceData) => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId,
            placeData.location
          );
          // console.log()
        })
      );
  }

  fetchPlaces(): Observable<any> {
    return this.http
      .get<{ [key: string]: PlaceData }>(
        'https://place-booking-1a473-default-rtdb.firebaseio.com/offered-places.json'
      )
      .pipe(
        map((resData) => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].availableFrom),
                  new Date(resData[key].availableTo),
                  resData[key].userId,
                  resData[key].location
                )
              );
            }
          }
          return places;
        }),
        tap((places) => {
          this._places.next(places);
        })
      );
  }

  addPlace(place: Place): Observable<any> {
    let generatedId;
    return this.http
      .post<{ name: string }>(
        'https://place-booking-1a473-default-rtdb.firebaseio.com/offered-places.json',
        { ...place, id: null }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap((places) => {
          place.id = generatedId;
          this._places.next(places.concat(place));
        })
      );
  }

  updatePlace(placeId: string, place: Place): Observable<any> {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return places;
        }
      }),
      take(1),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        updatedPlaces[updatedPlaceIndex] = place;
        return this.http.put(
          `https://place-booking-1a473-default-rtdb.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
