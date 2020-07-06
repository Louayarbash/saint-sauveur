import { Component, forwardRef, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

export function counterRangeValidatorMinutes(minValue, maxValue) {
  return (c: FormControl) => {
    const err = {
      rangeError: {
        given: c.value,
        min: minValue || 0,
        max: maxValue || 10
      }
    };

    return (c.value > +maxValue || c.value < +minValue) ? err : null;
  };
}

@Component({
  selector: 'app-counter-input-minutes',
  templateUrl: './counter-input.component.html',
  styleUrls: ['./counter-input.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CounterInputComponentMinutes), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CounterInputComponentMinutes), multi: true }
  ],
  encapsulation: ViewEncapsulation.None
})
export class CounterInputComponentMinutes implements ControlValueAccessor, OnChanges {
  // tslint:disable-next-line:no-input-rename
  @Input('counterValue') _counterValue=0;
  // tslint:disable-next-line:no-input-rename
  @Input('max') counterRangeMax;
  // tslint:disable-next-line:no-input-rename
  @Input('min') counterRangeMin;

  propagateChange: any = () => {}; // Noop function
  validateFn: any = () => {}; // Noop function

  get counterValue() {
    return this._counterValue;
  }

  set counterValue(val) {
    this._counterValue = val;
    this.propagateChange(val);
  }

  ngOnChanges(inputs) {
    if (inputs.counterRangeMax || inputs.counterRangeMin) {
      this.validateFn = counterRangeValidatorMinutes(this.counterRangeMin, this.counterRangeMax);
    }
  }

  writeValue(value) {
    if (value) {
      this.counterValue = value;
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  increase() {
    if(this.counterValue < 1440){
    this.counterValue = this.counterValue + 15;
  }
  }

  decrease() {
    if(this.counterValue > 0){
      this.counterValue = this.counterValue - 15;
    }
  }

  validate(c: FormControl) {
    return this.validateFn(c);
  }
}
