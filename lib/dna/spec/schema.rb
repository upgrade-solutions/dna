class DNA::Spec::Schema
  include ActiveModel::Model
  include ActiveModel::Validations

  attr_accessor :name, :description, :version, :properties
  validate :name_must_be_string, :version_must_be_numeric,
            :description_must_be_string, :properties_must_be_array

  def initialize(args = {})
    @name = args.fetch(:name, nil)
    @description = args.fetch(:description, nil)
    @version = args.fetch(:version, nil)
    @properties = args.fetch(:properties, [])
  end

  def self.array_from_dna_hash(dna_hash)
    if valid_dna_hash?(dna_hash)
      construct_array_from_dna_hash(dna_hash)
    else
      raise ArgumentError, "Invalid DNA Schema hash"
    end
  end

  private

  # argument: a hash of key-value pairs (key is the schema name, value is a hash of schema properties)
  def self.construct_array_from_dna_hash(dna_hash)
    schema_array = []
    dna_hash.each do |key, value|
      schema = new(
        name: key, 
        description: value['Description'],
        version: value['Version'],
        properties: DNA::Spec::Property.array_from_dna_hash(value['Properties'])
      )
      schema_array << schema
    end
    schema_array
  end

  def self.valid_dna_hash?(dna_hash)
    dna_hash.is_a?(Hash) && 
    dna_hash.keys.all? { |key| key.is_a?(String) }
  end

  def self.new_from_dna_hash(dna_hash)
    name = dna_hash.keys.first
    description = dna_hash.dig(name, 'Description')
    version = dna_hash.dig(name, 'Version')
    properties = DNA::Spec::Property.array_from_dna_hash(dna_hash[name]['Properties'])
    new(name: name, description: description, version: version, properties: properties)
  end

  def name_must_be_string
    unless name && name.is_a?(String)
      errors.add(:name, "must be present and a string")
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

  def properties_must_be_array
    if properties && !properties.is_a?(Array)
      errors.add(:properties, "must be an array")
    end
  end
end