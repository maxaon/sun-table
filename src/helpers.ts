module sun.helpers {
  interface Listener {
    callback:Function;
    context:any;
  }
  interface Listeners {
    [name:string]:Listener[];
  }
  export class Event {
    name: string;
    prevented: boolean;

    constructor(name) {
      this.name = name;
      this.prevented = false;
    }

    prevent() {
      this.prevented = true;
    }
  }

  export class Observable {
    private __listeners: Listeners;

    on(name, callback, context = this) {
      this.__listeners = this.__listeners || {};
      this.__listeners[name] = this.__listeners[name] || [];
      this.__listeners[name].push(
        {callback: callback, context: context}
      );
      return this;
    }

    emit(name: string, ...options: any[]) {
      var event: Event,
          listeners = (this.__listeners || {})[name] || [];

      if (options[0] instanceof Event) {
        event = options[0];
      }
      else {
        event = new Event(name);
        options.unshift(event);
      }

      for (var i = 0; i < listeners.length; i++) {
        listeners[i].callback.apply(listeners[i].context, options);
        if (event.prevented) {
          break
        }
      }
      return event
    }
  }

  export function attrToBoolean(attrs, name) {
    var value = attrs[name];
    if (value === 'false' || value === '0')
      return false;
    return attrs.hasOwnProperty(name);

  }

  export function camelToDash(str) {
    return str.replace(/\W+/g, '-')
      .replace(/([a-z\d])([A-Z])/g, '$1-$2');
  }

}