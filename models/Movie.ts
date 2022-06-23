import * as borsh from "@project-serum/borsh";

export class Movie {
  title: string;
  rating: number;
  description: string;

  constructor(title: string, rating: number, description: string) {
    this.title = title;
    this.rating = rating;
    this.description = description;
  }

  borshInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.str("title"),
    borsh.u8("rating"),
    borsh.str("description"),
  ]);

  static borshAccountSchema = borsh.struct([
    borsh.bool("initialized"),
    borsh.u8("rating"),
    borsh.str("title"),
    borsh.str("description"),
  ]);

  serialize(): Buffer {
    const buffer = Buffer.alloc(1000);
    this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
    return buffer.subarray(0, this.borshInstructionSchema.getSpan(buffer));
  }

  static deserialize(buffer?: Buffer): Movie | null {
    if (!buffer) {
      return null;
    }

    try {
      const { title, rating, description } =
        this.borshAccountSchema.decode(buffer);
      return new Movie(title, rating, description);
    } catch (error: any) {
      console.error("Deserialization error =>", error.message);
      return null;
    }
  }
}
