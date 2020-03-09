import { incomingPacket } from '../incoming-packet';
import { Player } from '../../world/actor/player/player';
import { RsBuffer } from '@server/net/rs-buffer';
import { widgets } from '@server/world/config/widget';
import { logger } from '@runejs/logger/dist/logger';
import { itemOnItemAction } from '@server/world/actor/player/action/item-on-item-action';
import { Position } from '@server/world/position';
import { gameCache, world } from '@server/game-server';
import { objectAction } from '@server/world/actor/player/action/object-action';
import { itemOnObjectAction } from '@server/world/actor/player/action/item-on-object-action';
import { World } from '@server/world/world';
import { npcAction } from '@server/world/actor/player/action/npc-action';
import { itemOnNpcAction } from '@server/world/actor/player/action/item-on-npc-action';

export const itemOnNpcPacket: incomingPacket = (player: Player, packetId: number, packetSize: number, packet: RsBuffer): void => {
    const npcIndex = packet.readNegativeOffsetShortBE();
    const itemId = packet.readNegativeOffsetShortBE();
    const itemSlot = packet.readNegativeOffsetShortLE();
    const itemWidgetId = packet.readShortBE();
    const itemContainerId = packet.readShortBE();

    let usedItem;
    if (itemWidgetId === widgets.inventory.widgetId && itemContainerId === widgets.inventory.containerId) {
        if (itemSlot < 0 || itemSlot > 27) {
            return;
        }

        usedItem = player.inventory.items[itemSlot];
        if (!usedItem) {
            return;
        }

        if (usedItem.itemId !== itemId) {
            return;
        }
    } else {
        logger.warn(`Unhandled item on object case using widget ${itemWidgetId}:${itemContainerId}`);
    }


    if (npcIndex < 0 || npcIndex > World.MAX_NPCS - 1) {
        return;
    }

    const npc = world.npcList[npcIndex];
    if (!npc) {
        return;
    }

    const position = npc.position;
    const distance = Math.floor(position.distanceBetween(player.position));

    // Too far away
    if (distance > 16) {
        return;
    }

    itemOnNpcAction(player, npc, position, usedItem, itemWidgetId, itemContainerId);

};