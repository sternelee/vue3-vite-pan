import { stat } from '@/utils/stat'

export default function (context, inject) {
  inject('stat', stat)
}
