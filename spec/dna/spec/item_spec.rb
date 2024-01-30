# frozen_string_literal: true
require 'spec_helper'

RSpec.describe DNA::Spec::Item do
  describe '#initialize' do
    context 'basic usage' do
      let(:key) { 'key' }
      let(:value) { 'value' }
      subject { described_class.new(key, value) }

      it 'creates an instance with the correct key' do
        expect(subject.key).to eq(key)
      end

      it 'creates an instance with the correct value' do
        expect(subject.value).to eq(value)
      end
    end

    context 'various value types' do
      it 'creates an instance with a string value_type' do
        subject = described_class.new('key', 'value')
        expect(subject.value_type).to eq('String')
      end

      it 'creates an instance with an integer value_type' do
        subject = described_class.new('key', 1)
        expect(subject.value_type).to eq('Integer')
      end

      it 'creates an instance with an object value_type' do
        subject = described_class.new('key', {})
        expect(subject.value_type).to eq('Hash')
      end

      it 'creates an instance with an array value_type' do
        subject = described_class.new('key', [])
        expect(subject.value_type).to eq('Array')
      end
    end
  end
end
