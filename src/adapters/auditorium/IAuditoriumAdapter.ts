import { Auditorium } from "../../domain/entities/Auditorium";
import { PublicAuditoriumDTO } from "../../domain/dtos/auditorium/PublicAuditoriumDTO";

/**
 * IAuditoriumAdapter
 *
 * Contract for the adapter layer that sits between the UseCase and Controller.
 * Its sole responsibility is to transform internal Auditorium domain entities
 * into safe, consumer-facing shapes.
 *
 * No method on this interface ever returns a type that contains:
 *  - id, ownerId, name, address, adminAdvance, auditoriumAdvance
 */
export type IAuditoriumAdapter = {
  /**
   * Strips all confidential fields from a single Auditorium entity.
   * Returns the safe PublicAuditoriumDTO shape.
   */
  toPublicDTO(auditorium: Auditorium): PublicAuditoriumDTO;

  /**
   * Strips confidential fields from a list of Auditorium entities.
   */
  toPublicDTOList(auditoriums: Auditorium[]): PublicAuditoriumDTO[];
};
