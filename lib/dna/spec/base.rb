class DNA::Spec::Base
  attr_accessor :dna, :schemas

  # TODO: support the following:
  # - validate data types (add to errors if not)
  # - validate required properties (add to errors if not)

  # - add DNA::Spec::Schema class

  # def initialize
  #   super
  # end

  def self.from_dna_hash(dna_hash)
    dna, schemas = nil
    dna_hash.each do |key, value|
      dna = key
      # schemas = Schema.multiple_from_dna_hash(value['Schemas'])
    end

    new(dna_hash)
  end
end