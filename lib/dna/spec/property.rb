require_relative 'property_constraint'

class DNA::Spec::Property
  include ActiveModel::Model
  include ActiveModel::Validations
  include DNA::Spec::PropertyConstraint

  attr_accessor :name, :property_type, :description

  validate :name_is_valid, :property_type_is_valid

  TYPES = %w(String Integer Number Boolean Date Array Object)

  def initialize(args = {})
    @name = args.fetch(:name, nil)
    @property_type = args.fetch(:property_type, nil)
    @description = args.fetch(:description, nil)
    @required = args.fetch(:required, nil)
    assign_constraints(args)
  end

  def self.array_from_dna_hash(dna_hash)
    property_array = []
    dna_hash.each do |key, value|
      property = if value.is_a?(Hash)
        new_from_expanded(key, value)
      else
        new_from_basic(key, value)
      end
      property_array << property
    end
    property_array
  end

  def self.new_from_basic(key, value)
    new(name: key, property_type: value)
  end

  def self.new_from_expanded(key, value)
    new(
      name: key, 
      property_type: value['PropertyType'],
      description: value['Description'], 
      required: value['Required'],
      string_max_length: value['StringMaxLength'], 
      string_min_length: value['StringMinLength'], 
      string_pattern: value['StringPattern'],
      boolean_equals: value['BooleanEquals']
    )
  end

  private

  def name_is_valid
    unless name && name.is_a?(String)
      errors.add(:name, "must be present and a string")
    end
  end

  def property_type_is_valid
    errors.add(:property_type, "must be present") if !property_type
    errors.add(:property_type, "must be a string") if !property_type.is_a?(String)
    errors.add(:property_type, "must be one of #{TYPES.join(', ')}") if !TYPES.include?(property_type)
  end

  def assign_constraints(args)
    send("assign_#{property_type.downcase}_constraints", args)
  end
end