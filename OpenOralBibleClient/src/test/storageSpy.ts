import { Observable, Subscriber } from "rxjs";

export const storageCreateSpy = Promise.resolve();
export const storageServiceSpy = 
    jasmine.createSpyObj('StorageSercice', ['getKey', 'setKey', {initializeDB: storageCreateSpy}]);

export const WrapObservable = (result) => {
    return new Observable(sub => {
        sub.next(result);
    });
}