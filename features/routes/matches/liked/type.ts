import { Swipe_actions, User } from "@/types/db";

/**
 * スワイプした人、された人の情報を含む型
 */
export interface Swipe_actions_user extends Swipe_actions{
    swiper?: User;
    swiped?: User;
}