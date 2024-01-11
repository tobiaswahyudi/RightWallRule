import { CONFIG } from "../config.js";
import { LinkedList, LinkedListNode } from "../utils/linkedList.js";
import { GunSlotDisplay, TurretSlotDisplay } from "./slotDisplay.js";

const LOG_MESSAGE_DURATION = 15;

class LogMessage extends LinkedListNode {
  constructor(message, ticks, color = "#FFFFFF") {
    super();
    this.message = message;
    this.endTicks = ticks + LOG_MESSAGE_DURATION * CONFIG.FPS;
    this.node = document.createElement('span');
    this.node.classList.add('log-message');
    this.node.style.color = color;
    this.node.innerHTML = message;

    document.getElementById('messages').appendChild(this.node);
  }
}

export class HUD {
  constructor(inventory) {
    this.inventory = inventory;
    this.avatar = document.getElementById('avatar');
    this.gunsContainer = document.getElementById('guns-container');
    this.turretsContainer = document.getElementById('turrets-container');
    this.hpbar = document.getElementById('hpbar-inner');

    this.gunSlots = this.inventory.guns.map(gun => new GunSlotDisplay(this.gunsContainer, gun, false));
    this.turretSlots = this.inventory.turrets.map((turret, idx) => new TurretSlotDisplay(this.turretsContainer, turret, false, idx));

    this.update();

    this.messages = new LinkedList();
    this.messagesToRemove = new LinkedList();
  }

  update() {
    this.gunSlots.forEach((slot, idx) => {
      slot.gun = this.inventory.guns[idx];
    });

    this.turretSlots.forEach((slot, idx) => {
      if(this.inventory.turrets[idx]) {
        slot.turret = this.inventory.turrets[idx];
      }
    })
  }

  set hp(val) {
    this.hpbar.style.width = `${val}%`;
  }

  tick(ticks) {
    if(!this.messages.empty() && this.messages.head.endTicks <= ticks + CONFIG.FPS * 0.5) {
      const head = this.messages.head;
      this.messages.pop();
      this.messagesToRemove.push(head);
      head.node.style.opacity = 0;
    }
    if(!(this.messagesToRemove.empty()) && this.messagesToRemove.head.endTicks <= ticks) {
      const head = this.messagesToRemove.head;
      this.messagesToRemove.pop();
      head.node.remove();
    }
  }

  log(message, ticks, color = "#FFFFFF") {
    this.messages.push(new LogMessage(message, ticks, color));
  }
}