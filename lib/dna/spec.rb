require 'active_model'

module DNA
  class Spec
    include ActiveModel::Model
    include ActiveModel::Validations

    attr_accessor :name, :description, :version, :schemas
    validate :name_must_be_dna, :version_must_be_numeric,
              :description_must_be_string, :schemas_must_be_array

    def initialize(args = {})
      @name = args.fetch(:name, nil)
      @description = args.fetch(:description, nil)
      @version = args.fetch(:version, nil)
      @schemas = args.fetch(:schemas, [])
    end

    # requires a hash instead of raw yaml
    def self.from_dna_hash(dna_hash)
      if valid_dna_hash?(dna_hash)
        new_from_dna_hash(dna_hash)
      else
        raise ArgumentError, "Invalid DNA hash"
      end
    end

    private

    def self.valid_dna_hash?(dna_hash)
      dna_hash.is_a?(Hash) &&
      dna_hash.keys.first == 'DNA' &&
      dna_hash['DNA'].is_a?(Hash)
    end

    def self.new_from_dna_hash(dna_hash)
      name = dna_hash.keys.first
      description = dna_hash.dig(name, 'Description')
      version = dna_hash.dig(name, 'Version')
      schemas = Schema.array_from_dna_hash(dna_hash[name]['Schemas'])
      new(name: name, description: description, version: version, schemas: schemas)
    end

    def name_must_be_dna
      unless name == 'DNA'
        errors.add(:name, "A DNA spec must start with 'DNA'")
      end
    end

    def version_must_be_numeric
      if version && !version.is_a?(Numeric)
        errors.add(:version, "must be a numeric (e.g. 1, 1.0, not 1.0.1)")
      end
    end

    def description_must_be_string
      if description && !description.is_a?(String)
        errors.add(:description, "must be a string")
      end
    end

    def schemas_must_be_array
      if schemas && !schemas.is_a?(Array)
        errors.add(:schemas, "must be an array")
      end
    end
  end
end